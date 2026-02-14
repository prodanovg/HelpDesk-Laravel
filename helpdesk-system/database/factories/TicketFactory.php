<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\TicketPriority;
use App\Models\TicketStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),

            'user_id' => User::query()->first()->id
                ?? User::factory()->create()->id,

            'team_id' => Team::query()->first()->id
                ?? Team::factory()->create()->id,

            'ticket_status_id' => TicketStatus::query()->first()->id
                ?? TicketStatus::factory()->create()->id,

            'ticket_priority_id' => TicketPriority::query()->first()->id
                ?? TicketPriority::factory()->create()->id,

            'assigned_to' => fake()->boolean(70)
                ? User::query()->inRandomOrder()->first()->id
                ?? User::factory()->create()->id
                : null,
        ];
    }
}
