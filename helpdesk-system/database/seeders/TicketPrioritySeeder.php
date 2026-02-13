<?php

namespace Database\Seeders;

use App\Models\TicketPriority;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TicketPrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TicketPriority::factory()->create([
            'name' => 'Low',
            'is_active' => true,
            'level' => 1,
        ]);

        TicketPriority::factory()->create([
            'name' => 'Medium',
            'is_active' => true,
            'level' => 2,
        ]);

        TicketPriority::factory()->create([
            'name' => 'High',
            'is_active' => true,
            'level' => 3,
        ]);

        TicketPriority::factory()->create([
            'name' => 'Critical',
            'is_active' => true,
            'level' => 4,
        ]);

    }
}
