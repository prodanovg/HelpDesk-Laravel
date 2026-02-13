<?php

namespace App\Http\Requests\TicketPriority;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\TicketPriority;

class UpdateTicketPriorityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', TicketPriority::class);
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'level' => 'sometimes|integer|min:1|max:10',
            'is_active' => 'boolean',
        ];
    }
}
