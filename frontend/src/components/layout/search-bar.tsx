"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Mic, TrendingUp, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchSearchSuggestions, SearchSuggestionItem } from "@/services/catalog";
import { formatPrice } from "@/lib/currency";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [trending, setTrending] = useState<string[]>([
    "Wireless Earbuds",
    "Smartphones",
    "Air Fryer",
    "Running Shoes",
    "Smartwatch",
  ]);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetchSearchSuggestions(query);
        setSuggestions(res.suggestions);
        if (res.trending?.length) {
          setTrending(res.trending);
        }
      } catch (err) {
        console.error("Search suggestion error", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      setQuery(speechText);
      setIsOpen(true);
      router.push(`/products?q=${encodeURIComponent(speechText)}`);
    };

    recognition.start();
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search 200+ electronics, fashion, mobiles..."
          className="pl-9 pr-16 h-10 w-full rounded-full bg-muted/40 focus:bg-background transition-all"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-3 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-1 rounded-full transition-colors ${
              isListening ? "text-rose-500 animate-pulse" : "text-muted-foreground hover:text-primary"
            }`}
            title="Search by Voice"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-12 left-0 w-full rounded-2xl border bg-popover/95 backdrop-blur-md shadow-2xl p-4 z-50 space-y-4">
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Matching Suggestions
              </span>
              <div className="space-y-1">
                {suggestions.map((item, idx) => (
                  <Link
                    key={idx}
                    href={
                      item.type === "product"
                        ? `/products/${item.slug}`
                        : item.type === "category"
                        ? `/products?category_slug=${item.slug}`
                        : `/products?brand_slug=${item.slug}`
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/80 transition-colors"
                  >
                    {item.image_url ? (
                      <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Search className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.type} {item.price_paise ? `• ${formatPrice(item.price_paise)}` : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Trending Searches */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-rose-500" />
              <span>Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trending.map((trend, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(trend);
                    setIsOpen(false);
                    router.push(`/products?q=${encodeURIComponent(trend)}`);
                  }}
                  className="text-xs font-medium bg-muted/60 hover:bg-primary hover:text-white px-3 py-1 rounded-full transition-colors"
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
