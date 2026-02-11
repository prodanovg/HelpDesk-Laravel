<?php

namespace Database\Factories;

use App\Models\Team;
use App\Models\TicketPriority;
use App\Models\TicketStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'user_id' => User::factory(),
            'team_id' => Team::factory(),

            'ticket_status_id' => TicketStatus::factory(),
            'ticket_priority_id' => TicketPriority::factory(),

            'assigned_to' =>  $this->faker->boolean(70)
                ? User::factory()
                : null,
        ];
    }
}
