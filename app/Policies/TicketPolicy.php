<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TicketPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }
        if ($user->role === 'agent') {
            return $ticket->assigned_to === $user->id;
        }
        if ($user->role === 'customer') {
            return $ticket->customer_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'customer';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        if (in_array($user->role, ['admin', 'manager'])) {
            return true;
        }
        if ($user->role === 'agent') {
            return $ticket->assigned_to === $user->id;
        }
        if ($user->role === 'customer') {
            return $ticket->customer_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->role === 'admin';

    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Ticket $ticket): bool
    {
        return $user->role === 'admin';    }

    /**
     * Determine whether the user can permanently delete the model.
     */
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
