use anyhow::Result;
use std::{
    fs,
    panic::{self, AssertUnwindSafe, UnwindSafe},
    path::{Path, PathBuf},
};
use wow_mpq::{Archive, FileEntry};

pub mod item;
pub mod item_class;
pub mod item_display_info;
pub mod item_sets;
pub mod item_sub_class;
pub mod spell_description_vars;
pub mod spells;

pub trait Handler: UnwindSafe {
    fn can_handle(&self, _file_entry: &FileEntry) -> bool {
        true
    }

    fn parse(&mut self, file_entry: &FileEntry, data: &[u8]) -> Result<()>;

    fn finish(&self);
}

/// Collect MPQ files in priority order.
#[inline(always)]
pub fn collect_mpqs(dir: &Path) -> Result<Vec<PathBuf>> {
    if !dir.exists() {
        return Ok(Vec::new());
    }

    let mut files: Vec<PathBuf> = fs::read_dir(dir)?
        .filter_map(|e| {
            let path = e.ok()?.path();
            if path
                .extension()
                .and_then(|s| s.to_str())
                .map(|s| s.eq_ignore_ascii_case("mpq"))
                .unwrap_or(false)
            {
                // Filter out files starting with "speech" (audio)
                if let Some(filename) = path.file_name().and_then(|s| s.to_str()) {
                    if filename.to_lowercase().starts_with("speech") {
                        return None;
                    }
                }
                Some(path)
            } else {
                None
            }
        })
        .collect();
    files.sort_by(|a, b| a.file_name().unwrap().cmp(b.file_name().unwrap()));
    Ok(files)
}

/// Parse DBC files from MPQ archives.
#[inline(always)]
pub fn parse_dbcs(mpq_paths: &[PathBuf], handlers: &mut [&mut dyn Handler]) -> Result<()> {
    for path in mpq_paths {
        println!("mpq: {}", path.display());
        let mut archive = Archive::open(path)?;
        for file_entry in archive.list()? {
            if !file_entry.name.to_lowercase().ends_with(".dbc") {
                continue;
            }
            let file_data = archive.read_file(&file_entry.name)?;
            for handler in handlers.iter_mut() {
                if handler.can_handle(&file_entry) {
                    // if we panic, just ignore and continue
                    let _ = panic::catch_unwind(AssertUnwindSafe(|| {
                        let _ = handler.parse(&file_entry, &file_data);
                    }));
                }
            }
        }
    }

    for handler in handlers.iter_mut() {
        handler.finish();
    }

    Ok(())
}
