<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketPriority>
 */
class TicketPriorityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->randomElement([
            'Low',
            'Medium',
            'High',
            'Critical',
        ]);

        return [
            'name' => $name,
            'level' => $this->faker->numberBetween(1, 5),
            'is_active' => true,
        ];
    }
}
