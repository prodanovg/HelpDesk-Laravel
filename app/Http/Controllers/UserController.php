<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Requests\User\UpdateUserPasswordRequest;
use App\Http\Resources\UserResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of users
     */
    public function index()
    {
        $this->authorize('viewAny', User::class);

        return UserResource::collection(User::all());
    }

    /**
     * Store a newly created user (admin only)
     */
    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return new UserResource($user);
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return new UserResource($user);
    }

    /**
     * Update the specified user (admin only)
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $user->update($request->validated());

        return new UserResource($user);
    }

    /**
     * Update own profile
     */
    public function updateProfile(UpdateProfileRequest $request, User $user)
    {
        $this->authorize('updateProfile', $user);

        $user->update($request->validated());

        return new UserResource($user);
    }

    /**
     * Update own password
     */
    public function updatePassword(UpdateUserPasswordRequest $request, User $user)
    {
        $this->authorize('updatePassword', $user);

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'error' => 'Current password is incorrect'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
