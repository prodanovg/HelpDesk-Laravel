<?php

namespace App\Services;

use App\Models\Team;
use App\Models\TicketPriority;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TicketAIService
{
    private const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    /**
     * Analyze ticket and suggest routing.
     */
    public function analyzeTicket(string $title, string $description): array
    {
        $teams = Team::where('is_active', true)
            ->get(['id', 'name', 'description']);

        $priorities = TicketPriority::where('is_active', true)
            ->orderBy('level')
            ->get(['id', 'name', 'level']);

        try {

            $prompt = $this->buildPrompt(
                $title,
                $description,
                $teams,
                $priorities
            );

            $response = $this->sendRequest($prompt);

            $content = data_get(
                $response->json(),
                'choices.0.message.content'
            );

            if (!$content) {
                throw new Exception('Empty AI response.');
            }

            return $this->parseResponse(
                $content,
                $teams,
                $priorities
            );

        } catch (Exception $e) {

            Log::error('Ticket AI analysis failed', [
                'message' => $e->getMessage(),
            ]);

            return $this->fallbackResponse($teams, $priorities);
        }
    }

    /**
     * Send request to Groq API.
     */
    private function sendRequest(string $prompt)
    {
        $apiKey = trim(env('GROQ_API_KEY'));
        Log::info('Groq model: ' . config('services.groq.model'));
        Log::info('Groq key exists: ' . (!empty($apiKey) ? 'YES' : 'NO'));

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])
            ->timeout(30)
            ->post(self::GROQ_API_URL, [

                'model' => 'llama-3.3-70b-versatile',

                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->systemPrompt(),
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ]
                ],

                'temperature' => 0.1,
                'max_tokens' => 200,
                'top_p' => 1,
                'stream' => false,
            ]);

        Log::info('Groq response status: ' . $response->status());

        if (!$response->successful()) {

            Log::error('Groq API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        }

        return $response->throw();
    }


    /**
     * System prompt.
     */
    private function systemPrompt(): string
    {
        return <<<PROMPT
You are an enterprise helpdesk AI assistant.

Your task:
- Classify tickets
- Select the best team
- Select the most appropriate priority

IMPORTANT:
- Return ONLY valid JSON
- Do not explain outside JSON
- Do not use markdown

Response format:

{
    "team_id": 1,
    "priority_id": 2,
    "confidence": "high",
    "reasoning": "Short explanation"
}
PROMPT;
    }

    /**
     * Build user prompt.
     */
    private function buildPrompt(
        string $title,
        string $description,
               $teams,
               $priorities
    ): string
    {

        $teamsList = $teams->map(function ($team) {
            return sprintf(
                '- ID: %d | %s | %s',
                $team->id,
                $team->name,
                $team->description ?? 'No description'
            );
        })->implode("\n");

        $prioritiesList = $priorities->map(function ($priority) {
            return sprintf(
                '- ID: %d | %s | Level: %d',
                $priority->id,
                $priority->name,
                $priority->level
            );
        })->implode("\n");

        return <<<PROMPT
TICKET TITLE:
{$title}

TICKET DESCRIPTION:
{$description}

AVAILABLE TEAMS:
{$teamsList}

AVAILABLE PRIORITIES:
{$prioritiesList}

Classification rules:
- Billing/payment issues -> Billing team
- Technical bugs/errors -> Technical team
- Login/account issues -> Support team
- Critical/down/system failure -> High priority
- Questions/information requests -> Lower priority
PROMPT;
    }

    /**
     * Parse AI response.
     */
    private function parseResponse(
        string $content,
               $teams,
               $priorities
    ): array
    {

        $content = trim($content);

        // Remove markdown JSON fences if model adds them
        $content = preg_replace('/```json|```/', '', $content);

        $data = json_decode($content, true);

        if (!$data) {
            throw new Exception('Invalid JSON returned from AI.');
        }

        $teamId = (int)($data['team_id'] ?? 0);
        $priorityId = (int)($data['priority_id'] ?? 0);

        // Validate team
        if (!$teams->contains('id', $teamId)) {
            $teamId = $teams->first()->id;
        }

        // Validate priority
        if (!$priorities->contains('id', $priorityId)) {
            $priorityId =
                $priorities->firstWhere('level', 2)->id
                ?? $priorities->first()->id;
        }

        return [
            'team_id' => $teamId,

            'priority_id' => $priorityId,

            'confidence' => $data['confidence'] ?? 'medium',

            'reasoning' => $data['reasoning']
                ?? 'AI classification completed.',
        ];
    }

    /**
     * Fallback response if AI fails.
     */
    private function fallbackResponse($teams, $priorities): array
    {
        return [
            'team_id' => $teams->first()->id ?? null,

            'priority_id' =>
                $priorities->firstWhere('level', 2)->id
                ?? $priorities->first()->id
                    ?? null,

            'confidence' => 'low',

            'reasoning' =>
                'AI classification unavailable. Default routing applied.',
        ];
    }
}
