<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
//    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin'),
            'role' => 'admin',
        ]);
        User::factory()->create([
            'name' => 'agent',
            'email' => 'agent@example.com',
            'password' => Hash::make('agent'),
            'role' => 'agent',
        ]);
        User::factory()->create([
            'name' => 'manager',
            'email' => 'manager@example.com',
            'password' => Hash::make('manager'),
            'role' => 'manager',
        ]);

        $this->call([
            TeamSeeder::class,
            TicketStatusSeeder::class,
            TicketPrioritySeeder::class,
            TicketSeeder::class,
        ]);

    }
}
