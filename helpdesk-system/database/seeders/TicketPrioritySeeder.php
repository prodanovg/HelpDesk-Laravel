<?php

namespace Database\Seeders;

use App\Models\TicketPriority;
use Illuminate\Database\Seeder;

class TicketPrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priorities = [
            ['name' => 'Low', 'level' => 1, 'is_active' => true],
            ['name' => 'Medium', 'level' => 2, 'is_active' => true],
            ['name' => 'High', 'level' => 3, 'is_active' => true],
            ['name' => 'Critical', 'level' => 4, 'is_active' => true],
        ];

        foreach ($priorities as $priority) {
            TicketPriority::firstOrCreate(
                ['level' => $priority['level']],
                $priority
            );
        }
    }
}
