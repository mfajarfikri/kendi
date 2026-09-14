<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'lokasi',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'isAdmin',
    ];

    /**
     * Check if user has a specific role
     */
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    /**
     * Accessor: is user an admin?
     * Dikirim ke frontend via Inertia share
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Scope a query to filter by user location permission.
     * Admin = no filter, non-admin = filter by user's lokasi column.
     */
    public function scopeForUser($query, ?User $user): void
    {
        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        if ($user->isAdmin) {
            return;
        }

        if (!$user->lokasi || trim($user->lokasi) === '') {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->where('lokasi', $user->lokasi);
    }

    public function trip()
    {
        return $this->hasMany(Trip::class );
    }

    public function tamu()
    {
        return $this->hasMany(Tamu::class );
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
