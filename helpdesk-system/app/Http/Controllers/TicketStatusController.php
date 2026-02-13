<?php

namespace App\Http\Controllers;

use App\Models\TicketStatus;
use App\Http\Requests\TicketStatus\StoreTicketStatusRequest;
use App\Http\Requests\TicketStatus\UpdateTicketStatusRequest;
use App\Http\Resources\TicketStatusResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Str;

class TicketStatusController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of statuses
     */
    public function index()
    {
        $this->authorize('viewAny', TicketStatus::class);

        $statuses = TicketStatus::where('is_active', true)->get();

        return TicketStatusResource::collection($statuses);
    }

    /**
     * Store a newly created status
     */
    public function store(StoreTicketStatusRequest $request)
    {
        $this->authorize('create', TicketStatus::class);

        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);

        $status = TicketStatus::create($data);

        return new TicketStatusResource($status);
    }

    /**
     * Display the specified status
     */
    public function show(TicketStatus $ticketStatus)
    {
        $this->authorize('view', $ticketStatus);

        return new TicketStatusResource($ticketStatus);
    }

    /**
     * Update the specified status
     */
    public function update(UpdateTicketStatusRequest $request, TicketStatus $ticketStatus)
    {
        $this->authorize('update', $ticketStatus);

        $data = $request->validated();

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $ticketStatus->update($data);

        return new TicketStatusResource($ticketStatus);
    }

    /**
     * Remove the specified status
     */
    public function destroy(TicketStatus $ticketStatus)
    {
        $this->authorize('delete', $ticketStatus);

        if (in_array($ticketStatus->slug, ['open', 'closed'])) {
            return response()->json([
                'error' => 'Cannot delete core status'
            ], 422);
        }

        $ticketStatus->delete();

        return response()->json([
            'message' => 'Status deleted successfully'
        ]);
    }
}
