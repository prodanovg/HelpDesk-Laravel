<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
use App\Models\TicketPriority;
use App\Models\TicketStatus;

class TicketPolicyTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function test_customer_can_create_ticket()
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $team = Team::factory()->create();
        $priority = TicketPriority::factory()->create();
        $status = TicketStatus::factory()->create(['name' => 'open']);

        $response = $this
            ->actingAs($customer, 'sanctum')
            ->postJson('/api/tickets', [
                'title' => 'Login issue',
                'description' => 'I cannot log in to my account',
                'team_id' => $team->id,
                'ticket_priority_id' => $priority->id,
            ]);

        $response->assertStatus(201);
    }

    #[Test]
    public function customer_can_view_own_ticket()
    {
        $customer = User::factory()->create([
            'role' => 'customer',
        ]);

        $ticket = Ticket::factory()->create([
            'user_id' => $customer->id,
        ]);

        $this->actingAs($customer, 'sanctum')
            ->getJson("/api/tickets/{$ticket->id}")
            ->assertStatus(200);
    }

    #[Test]
    public function customer_cannot_view_other_users_ticket()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $otherUser = User::factory()->create(['role' => 'customer']);

        $otherTicket = Ticket::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $this->actingAs($customer, 'sanctum')
            ->getJson("/api/tickets/{$otherTicket->id}")
            ->assertStatus(403);
    }


    #[Test]
    public function manager_can_view_any_ticket()
    {
        $manager = User::factory()->create([
            'role' => 'manager',
        ]);

        $ticket = Ticket::factory()->create();

        $this->actingAs($manager)
            ->getJson("/api/tickets/{$ticket->id}")
            ->assertStatus(200);
    }

    #[Test]
    public function admin_can_update_ticket_status()
    {
        // Create statuses first
        $openStatus = TicketStatus::factory()->create([
            'slug' => 'open',
            'name' => 'Open'
        ]);

        $closedStatus = TicketStatus::factory()->create([
            'slug' => 'closed',
            'name' => 'Closed'
        ]);

        $admin = User::factory()->create(['role' => 'admin']);

        $ticket = Ticket::factory()->create([
            'ticket_status_id' => $openStatus->id,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/status", [
                'ticket_status_id' => $closedStatus->id,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'ticket_status_id' => $closedStatus->id,
        ]);
    }
}
