<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = [
            [
                'name' => 'Technical Support',
                'description' => 'Handles technical issues, bugs, crashes, and software problems',
                'is_active' => true,
            ],
            [
                'name' => 'Billing & Payments',
                'description' => 'Manages invoices, payments, refunds, and subscription issues',
                'is_active' => true,
            ],
            [
                'name' => 'Account Support',
                'description' => 'Assists with login issues, password resets, and account settings',
                'is_active' => true,
            ],
            [
                'name' => 'Sales & Inquiries',
                'description' => 'Handles product questions, demos, quotes, and pricing information',
                'is_active' => true,
            ],
            [
                'name' => 'Customer Success',
                'description' => 'Provides onboarding, training, and best practices guidance',
                'is_active' => true,
            ],
        ];

        foreach ($teams as $team) {
            Team::firstOrCreate(
                ['name' => $team['name']],
                $team
            );
        }
    }
}
