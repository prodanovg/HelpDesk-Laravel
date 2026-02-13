<?php

namespace App\Policies;

use App\Models\User;
use App\Models\TicketStatus;

class TicketStatusPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, TicketStatus $ticketStatus): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, TicketStatus $ticketStatus): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, TicketStatus $ticketStatus): bool
    {
        return $user->isAdmin();
    }
}
