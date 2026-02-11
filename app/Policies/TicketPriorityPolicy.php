<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TicketPriority;

class TicketPriorityPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TicketPriority $ticketPriority): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, TicketPriority $ticketPriority): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, TicketPriority $ticketPriority): bool
    {
        return $user->isAdmin();
    }
}
