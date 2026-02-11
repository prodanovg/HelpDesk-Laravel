<?php

namespace App\Http\Requests\TicketPriority;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\TicketPriority;

class StoreTicketPriorityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', TicketPriority::class);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'level' => 'required|integer|min:1|max:10',
            'is_active' => 'boolean',
        ];
    }
}
