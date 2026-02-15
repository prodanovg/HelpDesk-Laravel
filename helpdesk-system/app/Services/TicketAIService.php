<?php

namespace App\Services;

use App\Models\Team;
use App\Models\TicketPriority;
use Exception;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class TicketAIService
{
    /**
     * Analyze ticket description and suggest team and priority
     */
    public function analyzeTicked(string $title, string $description): array
    {
        $teams = Team::where('is_active', true)->get(['id', 'name', 'description']);
        $priorities = TicketPriority::where('is_active', true)->orderBy('level')->get(['id', 'name', 'level']);

        $prompt = $this->buildPrompt($title, $description, $teams, $priorities);

        try {
            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a helpdesk ticket classification assistant. Analyze ticket descriptions and suggest the most appropriate team and priority level.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.2,
                'max_tokens' => 200,
            ]);

            $content = $response->choices[0]->message->content;

            return $this->parseAIResponse($content, $teams, $priorities);

        } catch (\Exception $e) {
            Log::error('OpenAI API Error: ' . $e->getMessage());

            return [
                'team_id' => $teams->first()->id ?? null,
                'priority_id' => $priorities->firstWhere('level', 2)->id ?? $priorities->first()->id,
                'confidence' => 'low',
                'reasoning' => 'AI analysis failed. Default suggestion provided.',
            ];
        }
    }

    /**
     * Build the prompt for OpenAI
     */
    private function buildPrompt(string $title, string $description, $teams, $priorities): string
    {
        $teamsList = $teams->map(function ($team) {
            return "- {$team->name} (ID: {$team->id})" . ($team->description ? ": {$team->description}" : '');
        })->join("\n");

        $prioritiesList = $priorities->map(function ($priority) {
            return "- {$priority->name} (ID: {$priority->id}, Level: {$priority->level})";
        })->join("\n");

        return <<<PROMPT
Analyze this support ticket and suggest the most appropriate team and priority level.

TICKET TITLE: {$title}

TICKET DESCRIPTION:
{$description}

AVAILABLE TEAMS:
{$teamsList}

AVAILABLE PRIORITIES:
{$prioritiesList}

Based on the ticket content, respond ONLY with a JSON object in this exact format:
{
    "team_id": <number>,
    "priority_id": <number>,
    "confidence": "<high|medium|low>",
    "reasoning": "<brief 1-sentence explanation>"
}

Consider:
- Keywords related to billing, payments → Billing team
- Technical errors, bugs, crashes → Technical team
- Account issues, login problems → Support team
- Urgent, critical, down, not working → Higher priority
- Question, how to, information → Lower priority
PROMPT;
    }

    /**
     * Parse AI response and validate
     */
    private function parseAIResponse(string $content, $teams, $priorities): array
    {
        try {
            $content = preg_replace('/```json\s*|\s*```/', '', $content);
            $content = trim($content);

            $data = json_decode($content, true);

            if (!$data || !isset($data['team_id']) || !isset($data['priority_id'])) {
                throw new \Exception('Invalid JSON response from AI');
            }

            $teamExists = $teams->contains('id', $data['team_id']);
            if (!$teamExists) {
                $data['team_id'] = $teams->first()->id;
                $data['confidence'] = 'low';
            }

            $priorityExists = $priorities->contains('id', $data['priority_id']);
            if (!$priorityExists) {
                $data['priority_id'] = $priorities->firstWhere('level', 2)->id ?? $priorities->first()->id;
                $data['confidence'] = 'low';
            }

            return [
                'team_id' => (int) $data['team_id'],
                'priority_id' => (int) $data['priority_id'],
                'confidence' => $data['confidence'] ?? 'medium',
                'reasoning' => $data['reasoning'] ?? 'AI suggestion based on ticket content.',
            ];

        } catch (Exception $e) {
            Log::error('OpenAI API Error: ' . $e->getMessage());

            if (str_contains($e->getMessage(), 'rate limit')) {
                return [
                    'team_id' => $teams->first()->id ?? null,
                    'priority_id' => $priorities->firstWhere('level', 2)->id ?? $priorities->first()->id,
                    'confidence' => 'low',
                    'reasoning' => '⏰ Rate limit reached. Please wait a moment and try again, or add credit to your OpenAI account.',
                ];
            }

            return [
                'team_id' => $teams->first()->id ?? null,
                'priority_id' => $priorities->firstWhere('level', 2)->id ?? $priorities->first()->id,
                'confidence' => 'low',
                'reasoning' => 'AI analysis failed. Default suggestion provided.',
            ];
        }
    }
}
