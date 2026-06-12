<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PruneOldPhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'photos:prune-old {--months=9 : Hapus file yang lebih tua dari jumlah bulan ini} {--dry-run : Tampilkan file yang akan dihapus tanpa benar-benar menghapus}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Menghapus file lama pada folder trip-photos, trip_photos, dan tamu-photos';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $months = max((int) $this->option('months'), 1);
        $dryRun = (bool) $this->option('dry-run');
        $cutoff = Carbon::now()->subMonths($months)->timestamp;
        $disk = Storage::disk('public');

        $directories = [
            'trip-photos',
            'trip_photos',
            'tamu-photos',
        ];

        $deletedCount = 0;
        $scannedCount = 0;

        $this->info(sprintf(
            '%s file foto yang lebih lama dari %d bulan.',
            $dryRun ? 'Simulasi penghapusan' : 'Menghapus',
            $months
        ));

        foreach ($directories as $directory) {
            if (!$disk->exists($directory)) {
                $this->line("Folder tidak ditemukan, dilewati: {$directory}");
                continue;
            }

            $files = $disk->allFiles($directory);
            $fileCount = count($files);
            $this->line("Memeriksa folder {$directory} ({$fileCount} file).");

            foreach ($files as $file) {
                $scannedCount++;
                $lastModified = $disk->lastModified($file);

                if ($lastModified > $cutoff) {
                    continue;
                }

                if ($dryRun) {
                    $this->line("Akan dihapus: {$file}");
                    $deletedCount++;
                    continue;
                }

                if ($disk->delete($file)) {
                    $this->line("Dihapus: {$file}");
                    $deletedCount++;
                } else {
                    $this->warn("Gagal menghapus: {$file}");
                }
            }
        }

        $this->newLine();
        $this->info("Total file diperiksa: {$scannedCount}");
        $this->info(
            $dryRun
                ? "Total file yang memenuhi syarat hapus: {$deletedCount}"
                : "Total file yang dihapus: {$deletedCount}"
        );

        return self::SUCCESS;
    }
}
