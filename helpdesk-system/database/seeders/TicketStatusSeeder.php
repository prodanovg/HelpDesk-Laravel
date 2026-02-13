<?php

namespace Database\Seeders;

use App\Models\TicketStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TicketStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        TicketStatus::factory()->create([
            'name' => 'Open',
            'is_active' => true,
            'slug' => 'open',
        ]);

        TicketStatus::factory()->create([
            'name' => 'In Progress',
            'is_active' => true,
            'slug' => 'in_progress',
        ]);

        TicketStatus::factory()->create([
            'name' => 'Closed',
            'is_active' => true,
            'slug' => 'closed',
        ]);
    }
}
