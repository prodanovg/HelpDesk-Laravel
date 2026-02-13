<?php

namespace App\Http\Controllers;

use App\Http\Resources\TicketResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
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
    use AuthorizesRequests, ValidatesRequests;

    //

    /**
     * Display a listing of tickets (scoped by role)
     */
    public function index()
    {
        $this->authorize('viewAny', Ticket::class);

        $tickets = match (auth()->user()->role) {
            'admin', 'manager' =>
            Ticket::with(['user', 'team', 'status', 'priority', 'assignee'])->get(),

            'agent' =>
            auth()->user()
                ->assignedTickets()
                ->with(['user', 'team', 'status', 'priority'])
                ->get(),

            'customer' =>
            auth()->user()
                ->tickets()
                ->with(['team', 'status', 'priority', 'assignee'])
                ->get(),
        };

        return TicketResource::collection($tickets);
    }

    /**
     * Store a newly created ticket
     */
    public function store(StoreTicketRequest $request)
    {
        $this->authorize('create', Ticket::class);

        $openStatus = TicketStatus::firstOrCreate(
            ['slug' => 'open'],
            ['name' => 'Open', 'is_active' => true]
        );

        $ticket = auth()->user()->tickets()->create([
            'title' => $request->title,
            'description' => $request->description,
            'team_id' => $request->team_id,
            'ticket_priority_id' => $request->ticket_priority_id,
            'ticket_status_id' => $openStatus->id,
        ]);

        $ticket->load(['user', 'team', 'status', 'priority']);

        return new TicketResource($ticket);
    }

    /**
     * Display the specified ticket
     */
    public function show(Ticket $ticket)
    {
        $this->authorize('view', $ticket);

        $ticket->load(['user', 'team', 'status', 'priority', 'assignee']);

        return new TicketResource($ticket);
    }

    /**
     * Update the specified ticket (title, description)
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        $this->authorize('update', $ticket);

        $ticket->update($request->validated());
        $ticket->load(['user', 'team', 'status', 'priority', 'assignee']);

        return new TicketResource($ticket);
    }

    /**
     * Assign ticket to an agent
     */
    public function assign(AssignTicketRequest $request, Ticket $ticket)
    {
        $this->authorize('assign', $ticket);

        $ticket->update([
            'assigned_to' => $request->assigned_to
        ]);

        $ticket->load(['assignee']);

        return new TicketResource($ticket);
    }

    /**
     * Update ticket status
     */
    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket)
    {
        $this->authorize('updateStatus', $ticket);

        $ticket->update([
            'ticket_status_id' => $request->ticket_status_id
        ]);

        $ticket->load(['status']);

        return new TicketResource($ticket);
    }

    /**
     * Update ticket priority
     */
    public function updatePriority(UpdateTicketPriorityRequest $request, Ticket $ticket)
    {
        $this->authorize('updatePriority', $ticket);

        $ticket->update([
            'ticket_priority_id' => $request->ticket_priority_id
        ]);

        $ticket->load(['priority']);

        return new TicketResource($ticket);
    }

    /**
     * Remove the specified ticket
     */
    public function destroy(Ticket $ticket)
    {
        $this->authorize('delete', $ticket);

        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully'
        ]);
    }
}
