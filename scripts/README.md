# Scripts Directory

This directory contains utility scripts for database management and maintenance.

## Available Scripts

### database-utils.js
Consolidated database utility script with multiple functions:

```bash
# Basic database check
node scripts/database-utils.js check

# Debug user relationships
node scripts/database-utils.js debug

# Final validation
node scripts/database-utils.js final

# Run all checks
node scripts/database-utils.js all
```

**Functions:**
- `check` - Basic database statistics and counts
- `debug` - Debug user relationships and missing records
- `final` - Final validation and data integrity check
- `all` - Run all checks in sequence

## Other Utility Scripts

### create-sample-data.js
Creates sample data for testing and development:
```bash
node create-sample-data.js
```

### test-enhanced-chatbot.js
Tests the enhanced chatbot functionality:
```bash
node test-enhanced-chatbot.js
```

### test-appointments.js
Tests appointment-related functionality:
```bash
node test-appointments.js
```

## Usage Tips

- Always run database checks before major changes
- Use `debug` command when troubleshooting user relationship issues
- Run `final` command after data migrations or major updates
- Keep backup of important data before running any modification scripts 