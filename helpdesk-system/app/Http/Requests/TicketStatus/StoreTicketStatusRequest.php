<?php

namespace App\Http\Requests\TicketStatus;

use App\Models\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;

class StoreTicketStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', TicketStatus::class);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:ticket_statuses,name',
            'is_active' => 'boolean',
        ];
    }
}
