export interface SystemResult {
  totalRows: number;
  cost: number;
  costPerRow: number;
  description: string;
  distribution: {
    halves: number;
    fulls: number;
    singles: number;
  };
}

export class StryktipsetSystemCalculator {
  private readonly COST_PER_ROW = 1; // 1 SEK per row

  /**
   * Generate all possible valid system combinations within a range
   */
  generateAllValidSystems(maxRows: number = 1000): SystemResult[] {
    const systems: SystemResult[] = [];
    
    // Generate combinations up to reasonable limits
    for (let halves = 0; halves <= 10; halves++) {
      for (let fulls = 0; fulls <= 6; fulls++) {
        for (let singles = 0; singles <= 13; singles++) {
          const totalMatches = halves + fulls + singles;
          
          // Skip if no meaningful system (need at least 1 match)
          if (totalMatches === 0) continue;
          
          // Skip if exceeds 13 matches (Stryktipset limit)
          if (totalMatches > 13) continue;
          
          const rows = this.calculateRows(halves, fulls, singles);
          
          // Skip if no system or too large
          if (rows === 0 || rows > maxRows) continue;
          
          // Avoid duplicate entries for systems with only singles
          if (halves === 0 && fulls === 0 && singles > 1) continue;
          
          systems.push({
            totalRows: rows,
            cost: rows * this.COST_PER_ROW,
            costPerRow: this.COST_PER_ROW,
            description: this.getDescription(halves, fulls, singles, rows),
            distribution: { halves, fulls, singles }
          });
        }
      }
    }
    
    // Remove duplicates and sort by number of rows
    const uniqueSystems = systems.filter((system, index, arr) => 
      arr.findIndex(s => s.totalRows === system.totalRows) === index
    );
    
    return uniqueSystems.sort((a, b) => a.totalRows - b.totalRows);
  }

  /**
   * Find the closest valid system to a target number of rows
   */
  findClosestSystem(targetRows: number): SystemResult {
    const allSystems = this.generateAllValidSystems();
    
    // Find exact match first
    const exactMatch = allSystems.find(s => s.totalRows === targetRows);
    if (exactMatch) return exactMatch;
    
    // Find closest match
    let closest = allSystems[0];
    let minDiff = Math.abs(allSystems[0].totalRows - targetRows);
    
    for (const system of allSystems) {
      const diff = Math.abs(system.totalRows - targetRows);
      if (diff < minDiff) {
        minDiff = diff;
        closest = system;
      }
    }
    
    return closest;
  }

  /**
   * Get all available system sizes for slider steps
   */
  getAvailableSystemSizes(maxRows: number = 1000): number[] {
    return this.generateAllValidSystems(maxRows).map(s => s.totalRows);
  }

  /**
   * Calculate the exact number of rows for a given distribution
   * Formula: (2^halves) * (3^fulls) * (1^singles)
   */
  calculateRows(halves: number, fulls: number, singles: number): number {
    return Math.pow(2, halves) * Math.pow(3, fulls) * Math.pow(1, singles);
  }

  private getDescription(halves: number, fulls: number, singles: number, rows: number): string {
    const parts: string[] = [];
    
    if (halves > 0) parts.push(`${halves} halvgardering${halves > 1 ? 'ar' : ''}`);
    if (fulls > 0) parts.push(`${fulls} helgardering${fulls > 1 ? 'ar' : ''}`);
    if (singles > 0) parts.push(`${singles} enkeltecken`);
    
    if (parts.length === 0) return 'Basissystem';
    
    return parts.join(', ');
  }
}