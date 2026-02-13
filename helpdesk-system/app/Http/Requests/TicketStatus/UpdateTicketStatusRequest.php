<?php

namespace App\Http\Requests\TicketStatus;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\TicketStatus;

class UpdateTicketStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', TicketStatus::class);
    }

    public function rules(): array
    {
        $ticketStatus = $this->route('ticketStatus');

        return [
            'name' => 'sometimes|string|max:255|unique:ticket_statuses,name,' . $ticketStatus->id,
            'is_active' => 'boolean',
        ];
    }
}
