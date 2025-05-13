<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserIndexRequest;
use App\Models\User;
use App\Services\UserService;

class UserController extends Controller
{
    public function index(UserIndexRequest $request, UserService $userService)
    {
        return response()->json($userService->getPaginatedUsers($request));
    }
}