<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'user_id' => $this->user_id,
            'assigned_to' => $this->assigned_to,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            'status' => [
                'id' => $this->status->id,
                'name' => $this->status->name,
                'slug' => $this->status->slug,
            ],

            'priority' => [
                'id' => $this->priority->id,
                'name' => $this->priority->name,
                'level' => $this->priority->level,
            ],

            'team' => [
                'id' => $this->team->id,
                'name' => $this->team->name,
            ],

            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],

            'assignee' => $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
            ] : null,
        ];
    }
}
