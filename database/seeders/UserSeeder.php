<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->delete();

        DB::table('users')->insert(array(
            0 =>
            array(
                'id' => 1,
                'name' => 'Muhammad Fajar Fikri Fadilah',
                'email' => 'fajarfikri31@gmail.com',
                'password' => bcrypt('Tjbt4pp04'),
                'role' => 'admin'
            ),
            1 =>
            array(
                'id' => 2,
                'name' => 'Admin UPT KRWG',
                'email' => 'admin@gmail.com',
                'password' => bcrypt('Plnterbaik123'),
                'role' => 'admin'
            ),
            2 =>
            array(
                'id' => 3,
                'name' => 'Security Karawang',
                'email' => 's.krwg@gmail.com',
                'password' => bcrypt('123123123'),
                'role' => 'user',
                'lokasi' => 'Karawang'
            ),
            3 =>
            array(
                'id' => 4,
                'name' => 'Security Purwakarta',
                'email' => 's.pwkta@gmail.com',
                'password' => bcrypt('123123123'),
                'role' => 'user',
                'lokasi' => 'Purwakarta'
            ),
        ));
    }
}
