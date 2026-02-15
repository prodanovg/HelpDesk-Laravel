<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Team;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');
        return $this->user()->can('update', $team);    }

    public function rules(): array
    {
        $team = $this->route('team');

        return [
            'name' => 'sometimes|string|max:255|unique:teams,name,' . $team->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
