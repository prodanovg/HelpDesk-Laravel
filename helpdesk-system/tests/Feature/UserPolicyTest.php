<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class UserPolicyTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function customer_cannot_list_users()
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $response = $this->actingAs($customer, 'sanctum')
            ->getJson('/api/users');

        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_list_users()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        User::factory()->count(3)->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'role'],
                ],
            ]);

    }

    #[Test]
    public function customer_cannot_update_other_user()
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $otherUser = User::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')
            ->putJson("/api/users/{$otherUser->id}", [
                'name' => 'Hacked Name',
            ]);

        $response->assertStatus(403);
    }

    #[Test]
    public function user_can_update_own_profile()
    {
        $user = User::factory()->create([
            'role' => 'customer',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/users/{$user->id}", [
                'name' => 'Updated Name',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    #[Test]
    public function admin_can_update_any_user()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $user = User::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/users/{$user->id}", [
                'name' => 'Admin Updated',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Admin Updated',
        ]);
    }
}
