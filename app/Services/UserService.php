<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;

class UserService
{
    public function getPaginatedUsers(Request $request)
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', $search);
                }

                $q->orWhere('name', 'ilike', "%$search%")
                  ->orWhere('email', 'ilike', "%$search%");
            });
        }

        return $query->paginate($request->input('limit'));
    }
}