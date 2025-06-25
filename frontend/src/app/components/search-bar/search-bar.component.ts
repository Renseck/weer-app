import { Component, Output, EventEmitter, OnInit, Sanitizer } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ApiService, LocationData } from '../../services/APIConnection/api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnInit{
  searchTerm: string = '';
  @Output() search = new EventEmitter<{term: string, cityName?: string}>();

  allLocations: LocationData[] = [];
  filteredLocations: LocationData[] = [];
  showSuggestions: boolean = false;
  isLoading: boolean = true;
  isPostcodeSearch: boolean = false;

  /* ============================================================================================ */
  constructor(private apiService: ApiService, private sanitizer: DomSanitizer) {}

  /* ============================================================================================ */
  ngOnInit(): void {
    this.apiService.getAllLocations().subscribe({
      next: (locations: LocationData[]) => {
        console.log("Loading locations:", locations.length);
        this.allLocations = locations;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading locations:", err);
        this.isLoading = false;
      }
    });
  }

  /* ============================================================================================ */
  onSearch() {
    if (this.searchTerm.trim()) {
      this.search.emit({term: this.searchTerm.trim()});
      this.showSuggestions = false;
    }
  }

  /* ============================================================================================ */
  onInput() {
    const term = this.searchTerm.toLowerCase().trim();

    this.isPostcodeSearch = /^\d/.test(term);

    if (term.length >= 2) {
      this.filteredLocations = this.limitResults(
        this.deduplicateLocations(
          this.orderMatchesByRelevance(
            this.findMatches(term),
            term
          )
        )
      );

      this.showSuggestions = this.filteredLocations.length > 0;
    }
    else
    {
      this.filteredLocations = [];
      this.showSuggestions = false;
    }
  }

  /* ============================================================================================ */
  selectSuggestion(location: LocationData) {
    this.searchTerm = location.woonplaats;
    this.showSuggestions = false;
    
    this.search.emit({
      term: location.woonplaats,
      cityName: location.woonplaats
    });
  }

  /* ============================================================================================ */
  highlightMatch(text: string, searchTerm: string): SafeHtml {
    if (!text || !searchTerm) return text;

    const regex = new RegExp(`(${searchTerm.toLowerCase()})`, 'gi');
    const highlighted = text.replace(regex, '<strong>$1</strong>');

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  /* ============================================================================================ */
  private findMatches(term: string): {
    postcodeMatches: LocationData[],
    woonplaatsMatches: LocationData[],
    gemeenteMatches: LocationData[]
  } {
    const postcodeMatches: LocationData[] = [];
    const woonplaatsMatches: LocationData[] = [];
    const gemeenteMatches: LocationData[] = [];

    const isPostcodeSearch = /^\d/.test(term);

    this.allLocations.forEach(loc => {
      // If searching for postcode
      if(isPostcodeSearch && loc.postcode) {
        if (loc.postcode.toLowerCase().startsWith(term)) {
          postcodeMatches.push(loc)
          return;
        }
      }

      // Ordinary woonplaats - gemeente search
      if (loc.woonplaats.toLowerCase().includes(term)) {
        woonplaatsMatches.push(loc);
      } else if (loc.gemeente.toLowerCase().includes(term)) {
        gemeenteMatches.push(loc);
      }
    });

    return { postcodeMatches, woonplaatsMatches, gemeenteMatches };
  }

  /* ============================================================================================ */
  private orderMatchesByRelevance(matches: {
    postcodeMatches: LocationData[],
    woonplaatsMatches: LocationData[],
    gemeenteMatches: LocationData[]
  }, term: string): LocationData[] {
    const sortByRelevance = (a: string, b: string, searchTerm: string): number => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const termLower = searchTerm.toLowerCase();
      
      // Check for exact match (case insensitive)
      const aExact = aLower === termLower;
      const bExact = bLower === termLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Check for starts with
      const aStarts = aLower.startsWith(termLower);
      const bStarts = bLower.startsWith(termLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // If both match in the same way, sort alphabetically
      return a.localeCompare(b);
    };

    // Sort each category alphabetically
    const sortedPostcodeMatches = [...matches.postcodeMatches]
    .sort((a, b) => sortByRelevance(a.postcode, b.postcode, term));

    const sortedWoonplaatsMatches = [...matches.woonplaatsMatches]
      .sort((a, b) => sortByRelevance(a.woonplaats, b.woonplaats, term));
    
    const sortedGemeenteMatches = [...matches.gemeenteMatches]
      .sort((a, b) => sortByRelevance(a.gemeente, b.gemeente, term));

    // Combine with woonplaats matches first
    return [...sortedPostcodeMatches, ...sortedWoonplaatsMatches, ...sortedGemeenteMatches];
  }

  /* ============================================================================================ */
  private deduplicateLocations(locations: LocationData[]): LocationData[] {
    const uniqueLocations: LocationData[] = [];
    const seen = new Set<string>();

    for (const location of locations) {
      const key = `${location.woonplaats}-${location.gemeente}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLocations.push(location);
      }
    }

    return uniqueLocations
  }
  /* ============================================================================================ */
  private limitResults(locations: LocationData[], maxResults: number = 10): LocationData[] {
    return locations.slice(0, maxResults);
  }
}
