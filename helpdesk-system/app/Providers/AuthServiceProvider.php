<?php

namespace App\Providers;

use App\Models\Team;
use App\Models\Ticket;
use App\Models\TicketPriority;
use App\Models\TicketStatus;
use App\Models\User;
use App\Policies\TeamPolicy;
use App\Policies\TicketPolicy;
use App\Policies\TicketPriorityPolicy;
use App\Policies\TicketStatusPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Ticket::class => TicketPolicy::class,
        User::class => UserPolicy::class,
        Team::class => TeamPolicy::class,
        TicketStatus::class => TicketStatusPolicy::class,
        TicketPriority::class => TicketPriorityPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
    public function register(): void
    {
        //
    }
}
