<?php

namespace Database\Factories;

use App\Models\TicketStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketStatus>
 */
class TicketStatusFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = TicketStatus::class;

    public function definition(): array
    {

        $name = $this->faker->randomElement([
            'Open',
            'In Progress',
            'Resolved',
            'Closed',
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'is_active' => true,
        ];

    }
}
