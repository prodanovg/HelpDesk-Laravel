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

            'status' => new TicketStatusResource($this->whenLoaded('status')),
            'priority' => new TicketPriorityResource($this->whenLoaded('priority')),
            'team' => new TeamResource($this->whenLoaded('team')),

            'created_by' => new UserResource($this->whenLoaded('user')),
            'assigned_to' => new UserResource($this->whenLoaded('assignee')),

            'created_at' => $this->created_at?->toISOString(),
        ];
    }

}
