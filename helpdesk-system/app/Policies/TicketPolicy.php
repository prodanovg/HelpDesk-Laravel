<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Auth\Access\Response;
class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Ticket $ticket): bool
    {
        logger()->info('POLICY HIT', [
            'user_id' => $user->id,
            'ticket_user_id' => $ticket->user_id,
            'role' => $user->role,
        ]);

        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }

        if ($user->isAgent()) {
            return $ticket->assigned_to === $user->id;
        }

        if ($user->isCustomer()) {
            return $ticket->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === 'customer';
    }

    public function update(User $user, Ticket $ticket): bool
    {
        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }

        if ($user->isAgent()) {
            return $ticket->assigned_to === $user->id;
        }

        if ($user->isCustomer()) {
            return $ticket->user_id === $user->id; // ✅ FIXED
        }

        return false;
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->role === 'admin';
    }

    public function restore(User $user, Ticket $ticket): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Ticket $ticket): bool
    {
        return $user->role === 'admin';
    }

    public function assign(User $user, Ticket $ticket): bool
    {
        return in_array($user->role, ['manager', 'admin']);
    }

    public function updateStatus(User $user, Ticket $ticket): bool
    {
        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }

        if ($user->isAgent()) {
            return $ticket->assigned_to === $user->id;
        }

        return false;
    }

    public function updatePriority(User $user, Ticket $ticket): bool
    {
        return in_array($user->role, ['manager', 'admin']);
    }
}
