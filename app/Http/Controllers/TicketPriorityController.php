<?php

namespace App\Http\Controllers;

use App\Models\TicketPriority;
use App\Http\Requests\TicketPriority\StoreTicketPriorityRequest;
use App\Http\Requests\TicketPriority\UpdateTicketPriorityRequest;
use App\Http\Resources\TicketPriorityResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TicketPriorityController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of priorities
     */
    public function index()
    {
        $priorities = TicketPriority::where('is_active', true)
            ->orderBy('level')
            ->get();

        return TicketPriorityResource::collection($priorities);
    }

    /**
     * Store a newly created priority
     */
    public function store(StoreTicketPriorityRequest $request)
    {
        $priority = TicketPriority::create($request->validated());

        return new TicketPriorityResource($priority);
    }

    /**
     * Display the specified priority
     */
    public function show(TicketPriority $ticketPriority)
    {
        return new TicketPriorityResource($ticketPriority);
    }

    /**
     * Update the specified priority
     */
    public function update(UpdateTicketPriorityRequest $request, TicketPriority $ticketPriority)
    {
        $ticketPriority->update($request->validated());

        return new TicketPriorityResource($ticketPriority);
    }

    /**
     * Remove the specified priority
     */
    public function destroy(TicketPriority $ticketPriority)
    {
        $this->authorize('delete', TicketPriority::class);

        $ticketPriority->delete();

        return response()->json([
            'message' => 'Priority deleted successfully'
        ]);
    }
}
