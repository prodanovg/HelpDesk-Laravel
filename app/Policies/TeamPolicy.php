<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Team;

class TeamPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Everyone can view teams list
    }

    public function view(User $user, Team $team): bool
    {
        return true; // Everyone can view a team
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Team $team): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Team $team): bool
    {
        return $user->isAdmin();
    }
}
