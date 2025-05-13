<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UserIndexRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge(['limit' => $this->input('limit', 10)]);
    }

    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            $limit = $this->input('limit');
            $totalUsers = User::count();

            if ($limit && $limit > $totalUsers) {
                $validator->errors()->add('limit', 'Users per page cannot be greater than total number of users (' . $totalUsers . ').');
            }
        });
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1'],
            'search' => ['nullable', 'string']
        ];
    }
}
