<?php

namespace Database\Seeders;

use App\Models\TicketStatus;
use Illuminate\Database\Seeder;

class TicketStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['name' => 'Open', 'slug' => 'open', 'is_active' => true],
            ['name' => 'In Progress', 'slug' => 'in_progress', 'is_active' => true],
            ['name' => 'Closed', 'slug' => 'closed', 'is_active' => true],
        ];

        foreach ($statuses as $status) {
            TicketStatus::firstOrCreate(
                ['slug' => $status['slug']],
                $status
            );
        }
    }
}
