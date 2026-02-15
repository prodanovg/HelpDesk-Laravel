<?php

namespace App\Http\Controllers;

use App\Services\TicketAIService;
use Illuminate\Http\Request;

class AIController extends Controller
{
    protected $aiService;

    public function __construct(TicketAIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Suggest team and priority for a ticket
     */
    public function suggestTicketClassification(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $suggestion = $this->aiService->analyzeTicked(
            $validated['title'],
            $validated['description']
        );

        return response()->json([
            'suggestion' => $suggestion,
        ]);
    }
}
