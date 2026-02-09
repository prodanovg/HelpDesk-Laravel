<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\TicketStatus;
use App\Http\Requests\Ticket\StoreTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketRequest;
use App\Http\Requests\Ticket\AssignTicketRequest;
use App\Http\Requests\Ticket\UpdateTicketStatusRequest;
use App\Http\Requests\Ticket\UpdateTicketPriorityRequest;

class TicketController extends Controller
{
    //
    /**
     * Display a listing of tickets (scoped by role)
     */
    public function index()
    {
        $this->authorize('viewAny', Ticket::class);

        $tickets = match(auth()->user()->role) {
            'admin', 'manager' => Ticket::with(['user', 'team', 'status', 'priority', 'assignee'])->get(),
            'agent' => auth()->user()->assignedTickets()->with(['user', 'team', 'status', 'priority'])->get(),
            'customer' => auth()->user()->tickets()->with(['team', 'status', 'priority', 'assignee'])->get(),
        };

        return response()->json($tickets);
    }

    /**
     * Store a newly created ticket
     */
    public function store(StoreTicketRequest $request)
    {
        $this->authorize('create', Ticket::class);

        // Get the default "Open" status
        $openStatus = TicketStatus::where('slug', 'open')->first();

        $ticket = auth()->user()->tickets()->create([
            'title' => $request->title,
            'description' => $request->description,
            'team_id' => $request->team_id,
            'ticket_priority_id' => $request->ticket_priority_id,
            'ticket_status_id' => $openStatus->id,
        ]);

        return response()->json($ticket->load(['team', 'status', 'priority']), 201);
    }

    /**
     * Display the specified ticket
     */
    public function show(Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        return response()->json($ticket->load(['user', 'team', 'status', 'priority', 'assignee']));
    }

    /**
     * Update the specified ticket (title, description)
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        $this->authorize('update', $ticket);

        $ticket->update($request->validated());

        return response()->json($ticket->load(['user', 'team', 'status', 'priority', 'assignee']));
    }

    /**
     * Assign ticket to an agent
     */
    public function assign(AssignTicketRequest $request, Ticket $ticket)
    {
        $this->authorize('assign', $ticket);

        $ticket->update(['assigned_to' => $request->assigned_to]);

        return response()->json($ticket->load(['assignee']));
    }

    /**
     * Update ticket status
     */
    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket)
    {
        $this->authorize('updateStatus', $ticket);

        $ticket->update(['ticket_status_id' => $request->ticket_status_id]);

        return response()->json($ticket->load(['status']));
    }

    /**
     * Update ticket priority
     */
    public function updatePriority(UpdateTicketPriorityRequest $request, Ticket $ticket)
    {
        $this->authorize('updatePriority', $ticket);

        $ticket->update(['ticket_priority_id' => $request->ticket_priority_id]);

        return response()->json($ticket->load(['priority']));
    }

    /**
     * Remove the specified ticket
     */
    public function destroy(Ticket $ticket)
    {
        $this->authorize('delete', $ticket);

        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted successfully']);
    }
}
