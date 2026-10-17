import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, useMap, InfoWindow } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Sun, 
  Zap, 
  Plane, 
  Battery, 
  Droplets, 
  Layers, 
  Activity, 
  MapPin, 
  Star, 
  Trash2, 
  Search, 
  Moon, 
  SunMedium, 
  Menu, 
  X,
  CheckCircle2,
  Globe,
  Cpu,
  Building2
} from 'lucide-react';

interface MapComponentProps {
  apiKey: string;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export type AgroSiteType = 'agro_zone' | 'solar_panel' | 'agro_drone' | 'hub_facility';

export interface AgroSite {
  id: string;
  nameBn: string;
  nameEn: string;
  type: AgroSiteType;
  location: { lat: number; lng: number };
  upazilaBn: string;
  upazilaEn: string;
  statusBn: string;
  statusEn: string;
  badgeColor: 'emerald' | 'amber' | 'cyan' | 'indigo';
  summaryBn: string;
  summaryEn: string;
  details: {
    // Agro Zone details
    cropBn?: string;
    cropEn?: string;
    stageBn?: string;
    stageEn?: string;
    moisturePercent?: number;
    soilPh?: number;
    npk?: string;
    ndvi?: number;
    temperatureC?: number;
    
    // Solar Panel details
    capacityKwp?: number;
    currentOutputKw?: number;
    dailyKwh?: number;
    pumpsCount?: number;
    flowRateLpm?: number;
    efficiencyPercent?: number;

    // Agro Drone details
    droneModel?: string;
    batteryPercent?: number;
    altitudeMeters?: number;
    speedKmh?: number;
    missionBn?: string;
    missionEn?: string;
    tankPercent?: number;
    coverageHa?: number;

    // Hub / Facility details
    capacityBn?: string;
    capacityEn?: string;
    connectedSensors?: number;
  };
}

// Thakurgaon Default Center
const THAKURGAON_COORDS = { lat: 26.0339, lng: 88.4617 };

// Curated Agricultural Sites in Thakurgaon, Bangladesh
const THAKURGAON_AGRO_SITES: AgroSite[] = [
  // --- Central Command & Agro Research Hub ---
  {
    id: 'thakurgaon-central-agro-hub',
    nameBn: 'ঠাকুরগাঁও কেন্দ্রীয় অ্যাগ্রো-টেক হাব ও রিসার্চ সেন্টার',
    nameEn: 'Thakurgaon Central Agro-Tech Hub & Research Base',
    type: 'hub_facility',
    location: { lat: 26.0339, lng: 88.4617 },
    upazilaBn: 'ঠাকুরগাঁও সদর',
    upazilaEn: 'Thakurgaon Sadar',
    statusBn: 'কন্ট্রোল গ্রিড সক্রিয়',
    statusEn: 'Command Hub Online',
    badgeColor: 'indigo',
    summaryBn: 'কেন্দ্রীয় কৃষি পর্যবেক্ষণ ও আইওটি ডেটা সমন্বয় হাব। জেলাজুড়ে অবস্থিত সয়েল সেন্সর, ড্রোন টেলিমেট্রি এবং সৌর সেচ পাম্প পরিচালনা করে।',
    summaryEn: 'Central agro-telemetry command center coordinating IoT soil probes, drone missions, and automated solar pumps across Thakurgaon.',
    details: {
      capacityBn: 'সার্ভার গ্রিড ও আইওটি ল্যাব',
      capacityEn: 'Server Grid & IoT Lab',
      connectedSensors: 148,
      temperatureC: 26.5
    }
  },

  // --- Agricultural Monitoring Zones ---
  {
    id: 'agro-sadar-aman-1',
    nameBn: 'ঠাকুরগাঁও সদর - উচ্চ ফলনশীল আমন ধান গবেষণা প্লট',
    nameEn: 'Thakurgaon Sadar - High-Yield Aman Rice Research Plot',
    type: 'agro_zone',
    location: { lat: 26.0382, lng: 88.4635 },
    upazilaBn: 'ঠাকুরগাঁও সদর',
    upazilaEn: 'Thakurgaon Sadar',
    statusBn: 'অনুকূল বৃদ্ধি (স্বাভাবিক)',
    statusEn: 'Optimal Growth',
    badgeColor: 'emerald',
    summaryBn: 'উচ্চ ফলনশীল ব্রি ধান-৮৭ প্লট। স্বয়ংক্রিয় ক্যাপাসিটিভ আর্দ্রতা সেন্সর ও জৈব নাইট্রোজেন ট্র্যাকার সমৃদ্ধ।',
    summaryEn: 'High-yielding BRRI Dhan-87 block fitted with subterranean moisture probes and organic nitrogen trackers.',
    details: {
      cropBn: 'আমন ধান (ব্রি ধান-৮৭)',
      cropEn: 'Aman Rice (BRRI-87)',
      stageBn: 'শীষ আসার পর্যায়',
      stageEn: 'Panicle Initiation',
      moisturePercent: 68,
      soilPh: 6.5,
      npk: '140-42-155',
      ndvi: 0.82,
      temperatureC: 27.8
    }
  },
  {
    id: 'agro-ranisankhail-paddy-2',
    nameBn: 'রানীশংকৈল স্মার্ট ভুট্টা ও বোরো ড্রিপ জোন',
    nameEn: 'Ranisankhail Smart Paddy & Maize Field',
    type: 'agro_zone',
    location: { lat: 26.0495, lng: 88.2580 },
    upazilaBn: 'রানীশংকৈল',
    upazilaEn: 'Ranisankhail',
    statusBn: 'সেচ নির্ধারিত (৬ ঘণ্টার মধ্যে)',
    statusEn: 'Irrigation Scheduled',
    badgeColor: 'emerald',
    summaryBn: 'নিবিড় ফসল চক্র এলাকা। ভূগর্ভস্থ আর্দ্রতা সেন্সরের সিগন্যাল অনুযায়ী স্বয়ংক্রিয় ড্রিপ সেচ প্রস্তুত।',
    summaryEn: 'Intensive crop rotation zone with subterranean soil moisture sensors; automated drip feed scheduled.',
    details: {
      cropBn: 'হাইব্রিড ভুট্টা ও বোরো ধান',
      cropEn: 'Hybrid Maize & Boro Paddy',
      stageBn: 'উদ্ভিজ্জ বৃদ্ধি পর্যায়',
      stageEn: 'Vegetative Phase',
      moisturePercent: 46,
      soilPh: 6.8,
      npk: '130-38-140',
      ndvi: 0.74,
      temperatureC: 29.1
    }
  },
  {
    id: 'agro-baliadangi-mustard-3',
    nameBn: 'বালিয়াডাঙ্গী অর্গানিক সরিষা ও চা বাগান ক্লাস্টার',
    nameEn: 'Baliadangi Organic Mustard & Tea Fields',
    type: 'agro_zone',
    location: { lat: 26.0960, lng: 88.2850 },
    upazilaBn: 'বালিয়াডাঙ্গী',
    upazilaEn: 'Baliadangi',
    statusBn: 'পূর্ণ প্রস্ফুটিত',
    statusEn: 'Healthy Bloom',
    badgeColor: 'emerald',
    summaryBn: 'উঁচু বেলে-দোআঁশ মাটির ক্লাস্টার। রাসায়নিকমুক্ত সরিষা ও চা চারার পরাগায়নকারী স্বাস্থ্য পর্যবেক্ষণ।',
    summaryEn: 'High-elevation sandy loam cluster tracking pollinator health and organic soil nitrogen for yellow mustard and tea bush.',
    details: {
      cropBn: 'হলুদ সরিষা ও চারা চা',
      cropEn: 'Yellow Mustard & Young Tea',
      stageBn: 'পূর্ণ ফুল ফোটা পর্যায়',
      stageEn: 'Full Flowering Stage',
      moisturePercent: 72,
      soilPh: 6.2,
      npk: '120-45-135',
      ndvi: 0.86,
      temperatureC: 26.4
    }
  },
  {
    id: 'agro-tangon-basin-4',
    nameBn: 'টাঙ্গন নদী পলিমাটি সমৃদ্ধ হাইড্রো-অ্যাগ্রো জোন',
    nameEn: 'Tangon River Basin Alluvial Agro Zone',
    type: 'agro_zone',
    location: { lat: 26.0210, lng: 88.4420 },
    upazilaBn: 'ঠাকুরগাঁও সদর',
    upazilaEn: 'Thakurgaon Sadar',
    statusBn: 'উচ্চ জৈব উপাদান',
    statusEn: 'High Organic Carbon',
    badgeColor: 'emerald',
    summaryBn: 'টাঙ্গন নদীর উর্বর পলি অববাহিকা। মাটির প্রাকৃতিক আর্দ্রতা ধারণ ক্ষমতা এবং উচ্চ উৎপাদনশীলতা সম্পন্ন।',
    summaryEn: 'Riparian fertile farmland fed by Tangon river alluvial silt; high soil moisture retention.',
    details: {
      cropBn: 'আখ ও শীতকালীন শাকসবজি',
      cropEn: 'Sugarcane & Winter Vegetables',
      stageBn: 'কুশি গজানো পর্যায়',
      stageEn: 'Tillering Phase',
      moisturePercent: 78,
      soilPh: 7.1,
      npk: '150-50-165',
      ndvi: 0.88,
      temperatureC: 27.2
    }
  },

  // --- Solar Panel Installations ---
  {
    id: 'solar-pirganj-array-1',
    nameBn: 'পীরগঞ্জ এগ্রিভোল্টাইক সোলার অ্যারে ও গভীর নলকূপ সেচ',
    nameEn: 'Pirganj Agrivoltaic & Deep Tubewell Array',
    type: 'solar_panel',
    location: { lat: 25.8565, lng: 88.3640 },
    upazilaBn: 'পীরগঞ্জ',
    upazilaEn: 'Pirganj',
    statusBn: 'সেচ পাম্প চলছে (সক্রিয়)',
    statusEn: 'Active Pumping',
    badgeColor: 'amber',
    summaryBn: '২৫০ কিলোওয়াট পিক (250 kWp) উন্নত বাইফেসিয়াল সোলার অ্যারে। নিচে ফসল উৎপাদনের পাশাপাশি ১২টি গভীর নলকূপ পরিচালনা করে।',
    summaryEn: '250 kWp bifacial elevated PV panels enabling ground crop cultivation beneath while powering 12 deep tubewells.',
    details: {
      capacityKwp: 250,
      currentOutputKw: 218.4,
      dailyKwh: 1240,
      pumpsCount: 12,
      flowRateLpm: 460,
      efficiencyPercent: 98.2
    }
  },
  {
    id: 'solar-sadar-pump-2',
    nameBn: 'ঠাকুরগাঁও গ্রিড সোলার সেচ স্টেশন #৪',
    nameEn: 'Thakurgaon Grid Solar Irrigation Station #4',
    type: 'solar_panel',
    location: { lat: 26.0290, lng: 88.4720 },
    upazilaBn: 'ঠাকুরগাঁও সদর',
    upazilaEn: 'Thakurgaon Sadar',
    statusBn: 'সর্বোচ্চ সৌর শক্তি উৎপাদন',
    statusEn: 'Peak Output',
    badgeColor: 'amber',
    summaryBn: '৭৫ কিলোওয়াট পিক সোলার পাম্পিং সিস্টেম। ৬০ হেক্টর জমিতে নিয়ন্ত্রিত চাপযুক্ত পাইপলাইনে পানি সরবরাহ করে।',
    summaryEn: '75 kWp community solar pump system feeding 60 hectares of paddy fields with smart flow valves.',
    details: {
      capacityKwp: 75,
      currentOutputKw: 68.7,
      dailyKwh: 360,
      pumpsCount: 4,
      flowRateLpm: 210,
      efficiencyPercent: 97.8
    }
  },
  {
    id: 'solar-haripur-microgrid-3',
    nameBn: 'হরিপুর সোলার মাইক্রোগ্রিড ও কোল্ড স্টোরেজ',
    nameEn: 'Haripur Agrivoltaic Microgrid & Cold Storage',
    type: 'solar_panel',
    location: { lat: 25.9640, lng: 88.1460 },
    upazilaBn: 'হরিপুর',
    upazilaEn: 'Haripur',
    statusBn: 'গ্রিড এক্সপোর্ট সক্রিয়',
    statusEn: 'Grid Export Active',
    badgeColor: 'amber',
    summaryBn: '১২০ কিলোওয়াট সৌর মাইক্রোগ্রিড। আলুর বীজ সংরক্ষণাগার এবং স্থানীয় কৃষকদের জন্য সৌর শক্তি সরবরাহ করে।',
    summaryEn: '120 kWp solar array supplying off-grid cold storage for potato seed preservation and livestock pumps.',
    details: {
      capacityKwp: 120,
      currentOutputKw: 104.2,
      dailyKwh: 580,
      pumpsCount: 6,
      flowRateLpm: 310,
      efficiencyPercent: 98.6
    }
  },
  {
    id: 'solar-baliadangi-drip-4',
    nameBn: 'বালিয়াডাঙ্গী স্মার্ট ড্রিপ-সোলার পাম্প স্টেশন',
    nameEn: 'Baliadangi Smart Drip-Solar Pump Station',
    type: 'solar_panel',
    location: { lat: 26.0880, lng: 88.2720 },
    upazilaBn: 'বালিয়াডাঙ্গী',
    upazilaEn: 'Baliadangi',
    statusBn: 'স্বয়ংক্রিয় ফিড সচল',
    statusEn: 'Automated Feed',
    badgeColor: 'amber',
    summaryBn: '৪৫ কিলোওয়াট সৌর কেন্দ্র। মাটির আইওটি সেন্সরের সংকেত অনুযায়ী স্বয়ংক্রিয়ভাবে ড্রিপ লাইনে পানি ও পুষ্টি পৌঁছায়।',
    summaryEn: '45 kWp automated solar pumping facility with IoT pressure regulators for micro-irrigation.',
    details: {
      capacityKwp: 45,
      currentOutputKw: 41.0,
      dailyKwh: 215,
      pumpsCount: 2,
      flowRateLpm: 125,
      efficiencyPercent: 97.4
    }
  },

  // --- Agro-Drone Operations ---
  {
    id: 'drone-alpha-surveyor',
    nameBn: 'অ্যাগ্রোড্রোন আলফা - মাল্টিস্পেকট্রাল এনডিভিআই সার্ভেয়ার',
    nameEn: 'AgroDrone Alpha - Multispectral NDVI Surveyor',
    type: 'agro_drone',
    location: { lat: 26.0415, lng: 88.4550 },
    upazilaBn: 'ঠাকুরগাঁও সদর',
    upazilaEn: 'Thakurgaon Sadar',
    statusBn: 'উড্ডয়নে (৩৫মি উচ্চতায়)',
    statusEn: 'In Flight (35m AGL)',
    badgeColor: 'cyan',
    summaryBn: 'স্বয়ংক্রিয় হেক্সাকপ্টার ড্রোন। ৫-ব্যান্ড মাল্টিস্পেকট্রাল ক্যামেরার মাধ্যমে ফসলের ক্লোরোফিল এবং রোগবালাই নির্ণয় করছে।',
    summaryEn: 'Autonomous hexacopter conducting 5-band multispectral scan for chlorophyll index and early blight detection.',
    details: {
      droneModel: 'AeroScout Hexa-Pro 5B',
      batteryPercent: 78,
      altitudeMeters: 35,
      speedKmh: 18.5,
      missionBn: 'এনডিভিআই ফসলের স্বাস্থ্য ম্যাপিং',
      missionEn: 'Multispectral NDVI Mapping',
      coverageHa: 42.5
    }
  },
  {
    id: 'drone-beta-sprayer',
    nameBn: 'ক্রপকপ্টার বিটা - প্রিসিশন বায়ো-স্প্রেয়িং ড্রোন',
    nameEn: 'CropCopter Beta - Precision Bio-Spraying Drone',
    type: 'agro_drone',
    location: { lat: 26.0480, lng: 88.2630 },
    upazilaBn: 'রানীশংকৈল',
    upazilaEn: 'Ranisankhail',
    statusBn: 'বায়ো-নিউট্রিয়েন্ট স্প্রে চলছে',
    statusEn: 'Precision Spraying',
    badgeColor: 'cyan',
    summaryBn: '১৬ লিটার ট্যাংকযুক্ত কৃষি ড্রোন। সেন্টিমিটার আরটিকে নির্ভুলতায় অনুপুষ্টি ও জৈব বালাইনাশক স্প্রে করে।',
    summaryEn: 'Equipped with 16L micronizer spray nozzles applying bio-fertilizer and organic nutrients with centimeter RTK accuracy.',
    details: {
      droneModel: 'Agras T16 AgroSprayer',
      batteryPercent: 62,
      altitudeMeters: 4.5,
      speedKmh: 12.0,
      missionBn: 'ইউএলভি জৈব পুষ্টি স্প্রে মিশন',
      missionEn: 'ULV Bio-Nutrient Spraying',
      tankPercent: 55,
      coverageHa: 14.2
    }
  },
  {
    id: 'drone-gamma-thermal',
    nameBn: 'স্কাইস্কাউট গামা - সয়েল থার্মাল ও স্ট্রেস প্যাট্রোল',
    nameEn: 'SkyScout Gamma - Soil Thermal & Stress Patrol',
    type: 'agro_drone',
    location: { lat: 26.0255, lng: 88.4680 },
    upazilaBn: 'ঠাকুরগাঁও সদর',
    upazilaEn: 'Thakurgaon Sadar',
    statusBn: 'হোভারিং (থার্মাল পর্যবেক্ষণ)',
    statusEn: 'Hovering & Thermal Scan',
    badgeColor: 'cyan',
    summaryBn: 'থার্মাল সেন্সর ড্রোন। মাটির তাপমাত্রা পার্থক্য ও ভূগর্ভস্থ সেচ পাইপলাইন লিকেজ শনাক্ত করতে পাহারা দিচ্ছে।',
    summaryEn: 'Long-endurance quadcopter analyzing soil thermal differentials along river beds to flag underground pipe leaks.',
    details: {
      droneModel: 'ThermalScout Quad MK-IV',
      batteryPercent: 88,
      altitudeMeters: 22,
      speedKmh: 0,
      missionBn: 'তাপমাত্রা ও মাটি স্ট্রেস বিশ্লেষণ',
      missionEn: 'Thermal Stress & Moisture Analysis',
      coverageHa: 19.8
    }
  }
];

// Upazila navigation points
const THAKURGAON_UPAZILAS = [
  { nameBn: 'ঠাকুরগাঁও সদর', nameEn: 'Thakurgaon Sadar', lat: 26.0339, lng: 88.4617, zoom: 13 },
  { nameBn: 'পীরগঞ্জ (সোলার হাব)', nameEn: 'Pirganj (Solar Hub)', lat: 25.8565, lng: 88.3640, zoom: 14 },
  { nameBn: 'রানীশংকৈল (ধান/ভুট্টা)', nameEn: 'Ranisankhail (Paddy)', lat: 26.0495, lng: 88.2580, zoom: 13 },
  { nameBn: 'বালিয়াডাঙ্গী (সরিষা/চা)', nameEn: 'Baliadangi (Mustard)', lat: 26.0960, lng: 88.2850, zoom: 13 },
  { nameBn: 'হরিপুর (মাইক্রোগ্রিড)', nameEn: 'Haripur (Microgrid)', lat: 25.9640, lng: 88.1460, zoom: 13 },
  { nameBn: 'টাঙ্গন নদী অববাহিকা', nameEn: 'Tangon River Basin', lat: 26.0210, lng: 88.4420, zoom: 14 },
];

export default function MapComponent({ apiKey, isDarkMode, setIsDarkMode }: MapComponentProps) {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [activeCategory, setActiveCategory] = useState<'all' | AgroSiteType>('all');
  const [selectedSite, setSelectedSite] = useState<AgroSite | null>(null);
  const [watchlist, setWatchlist] = useState<AgroSite[]>([]);
  const [activeTab, setActiveTab] = useState<'sites' | 'watchlist'>('sites');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 640);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('hybrid');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Controlled map coordinates
  const [mapCenter, setMapCenter] = useState(THAKURGAON_COORDS);
  const [mapZoom, setMapZoom] = useState(13);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter sites based on category and search query
  const filteredSites = THAKURGAON_AGRO_SITES.filter(site => {
    const matchesCategory = activeCategory === 'all' || site.type === activeCategory;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      site.nameEn.toLowerCase().includes(searchLower) ||
      site.nameBn.toLowerCase().includes(searchLower) ||
      site.upazilaEn.toLowerCase().includes(searchLower) ||
      site.upazilaBn.toLowerCase().includes(searchLower) ||
      site.summaryEn.toLowerCase().includes(searchLower) ||
      site.summaryBn.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const toggleWatchlist = (site: AgroSite) => {
    if (watchlist.some(item => item.id === site.id)) {
      setWatchlist(watchlist.filter(item => item.id !== site.id));
      showToast(lang === 'bn' ? `ওয়াচলিস্ট থেকে সরানো হয়েছে: ${site.nameBn}` : `Removed from watchlist: ${site.nameEn}`);
    } else {
      setWatchlist([...watchlist, site]);
      showToast(lang === 'bn' ? `ওয়াচলিস্টে যোগ করা হয়েছে: ${site.nameBn}` : `Added to watchlist: ${site.nameEn}`);
    }
  };

  const showToast = (message: string) => {
    setActionNotice(message);
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  return (
    <div className="w-full h-full relative overflow-hidden font-sans">
      <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'geometry', 'core']} version="weekly">
        <GoogleMap
          defaultCenter={mapCenter}
          zoom={mapZoom}
          mapTypeId={mapType}
          renderingType="VECTOR"
          onCenterChanged={(ev) => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              setMapCenter(ev.detail.center);
            }, 300);
          }}
          onZoomChanged={(ev) => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              setMapZoom(ev.detail.zoom);
            }, 300);
          }}
          mapId="DEMO_MAP_ID"
          colorScheme={isDarkMode ? 'DARK' : 'LIGHT'}
          className="w-full h-full"
          disableDefaultUI={false}
          mapTypeControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio', 'ais_demo_api_key_applet_x7b2c9d4e1']}
          clickableIcons={false}
        >
          {/* Custom Markers Rendering */}
          <AgroMarkersRenderer 
            sites={filteredSites}
            selectedSite={selectedSite}
            setSelectedSite={setSelectedSite}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
            isDarkMode={isDarkMode}
            showToast={showToast}
            lang={lang}
          />
        </GoogleMap>
      </APIProvider>

      {/* Floating Action Notice / Toast */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 right-4 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md px-4 py-2.5 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Map Toolbar: Language & Satellite Toggle */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all border border-slate-200 dark:border-slate-700"
          title="Toggle Language (English / বাংলা)"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <span>{lang === 'en' ? 'EN / বাংলা' : 'বাংলা (BN)'}</span>
        </button>

        <button
          onClick={() => setMapType(mapType === 'hybrid' ? 'roadmap' : 'hybrid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mapType === 'hybrid'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Toggle Satellite Field View"
        >
          <Layers className="w-3.5 h-3.5" />
          {mapType === 'hybrid' 
            ? (lang === 'bn' ? 'স্যাটেলাইট ফিল্ড ভিউ' : 'Satellite Field View') 
            : (lang === 'bn' ? 'ম্যাপ ভিউ' : 'Roadmap View')}
        </button>
      </div>

      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="sm:hidden absolute top-4 left-4 z-30 p-3 rounded-full shadow-2xl bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 transition-all active:scale-95"
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Main Telemetry & Navigation Sidebar */}
      <motion.div
        initial={{ x: -440, opacity: 0 }}
        animate={{
          x: isSidebarOpen ? 0 : -440,
          opacity: 1
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="absolute top-4 left-4 bottom-8 w-[calc(100%-2rem)] sm:w-[400px] shadow-2xl z-20 flex flex-col border overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200 dark:border-slate-800 rounded-2xl"
      >
        {/* Brand Header */}
        <div className="p-4 border-b shrink-0 bg-linear-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-white text-base shadow-inner border border-white/20">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight leading-tight">
                  {lang === 'bn' ? 'স্মার্ট অ্যাগ্রো ম্যাপ প্ল্যানার' : 'Smart Agro Map Planner'}
                </h1>
                <p className="text-[11px] text-emerald-100 font-medium">
                  {lang === 'bn' ? 'ঠাকুরগাঁও কৃষি ও সোলার গ্রিড' : 'Thakurgaon Agro & Solar Grid'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Switcher for Mobile */}
              <button
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-black text-white sm:hidden"
              >
                {lang === 'en' ? 'বাংলা' : 'ENG'}
              </button>

              <button
                onClick={() => setMapType(mapType === 'hybrid' ? 'roadmap' : 'hybrid')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white sm:hidden"
                title="Toggle Satellite view"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Moon className="w-4 h-4" /> : <SunMedium className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Jump Upazila Selector */}
          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 mb-1.5 flex items-center justify-between">
              <span>{lang === 'bn' ? 'উপজেলা ও এলাকা নির্বাচন' : 'Thakurgaon Upazilas'}</span>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded font-mono">26.0339° N, 88.4617° E</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {THAKURGAON_UPAZILAS.map((upz) => (
                <button
                  key={upz.nameEn}
                  onClick={() => {
                    setMapCenter({ lat: upz.lat, lng: upz.lng });
                    setMapZoom(upz.zoom);
                    const matching = THAKURGAON_AGRO_SITES.find(s => s.upazilaEn.includes(upz.nameEn.split(' ')[0]));
                    if (matching) setSelectedSite(matching);
                  }}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/10"
                >
                  {lang === 'bn' ? upz.nameBn : upz.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Switcher: Live Sites vs Watchlist */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'sites'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {lang === 'bn' ? `লাইভ সেন্সর (${filteredSites.length})` : `Live Telemetry (${filteredSites.length})`}
          </button>
          
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'watchlist'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            {lang === 'bn' ? `সংরক্ষিত ওয়াচলিস্ট (${watchlist.length})` : `Watchlist (${watchlist.length})`}
          </button>
        </div>

        {/* Category Filter Chips & Search Bar */}
        {activeTab === 'sites' && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'খুঁজুন: জোন, সোলার প্যানেল, ড্রোন...' : 'Search zones, solar arrays, drones...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Buttons */}
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {lang === 'bn' ? 'সব (১২)' : 'All (12)'}
              </button>
              <button
                onClick={() => setActiveCategory('agro_zone')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-all ${
                  activeCategory === 'agro_zone'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                }`}
              >
                <Sprout className="w-3 h-3" />
                {lang === 'bn' ? 'অ্যাগ্রো (৪)' : 'Agro (4)'}
              </button>
              <button
                onClick={() => setActiveCategory('solar_panel')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-all ${
                  activeCategory === 'solar_panel'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                }`}
              >
                <Sun className="w-3 h-3" />
                {lang === 'bn' ? 'সোলার (৪)' : 'Solar (4)'}
              </button>
              <button
                onClick={() => setActiveCategory('agro_drone')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-all ${
                  activeCategory === 'agro_drone'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100'
                }`}
              >
                <Plane className="w-3 h-3" />
                {lang === 'bn' ? 'ড্রোন (৩)' : 'Drone (3)'}
              </button>
            </div>
          </div>
        )}

        {/* Scrollable List Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {activeTab === 'sites' ? (
            filteredSites.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">
                  {lang === 'bn' ? 'কোনো পর্যবেক্ষণ সাইট পাওয়া যায়নি।' : 'No monitoring sites match your filter.'}
                </p>
              </div>
            ) : (
              filteredSites.map((site) => {
                const isSelected = selectedSite?.id === site.id;
                const inWatchlist = watchlist.some(w => w.id === site.id);

                return (
                  <div
                    key={site.id}
                    onClick={() => {
                      setSelectedSite(site);
                      setMapCenter(site.location);
                      setMapZoom(14);
                      if (window.innerWidth < 640) setIsSidebarOpen(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Type Icon Badge */}
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          site.type === 'hub_facility'
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                            : site.type === 'agro_zone'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                            : site.type === 'solar_panel'
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                            : 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400'
                        }`}>
                          {site.type === 'hub_facility' && <Building2 className="w-4 h-4" />}
                          {site.type === 'agro_zone' && <Sprout className="w-4 h-4" />}
                          {site.type === 'solar_panel' && <Sun className="w-4 h-4" />}
                          {site.type === 'agro_drone' && <Plane className="w-4 h-4" />}
                        </div>

                        <div>
                          <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {lang === 'bn' ? site.nameBn : site.nameEn}
                          </h2>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {lang === 'bn' ? site.upazilaBn : site.upazilaEn}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(site);
                        }}
                        className={`p-1 rounded-lg transition-colors ${
                          inWatchlist 
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' 
                            : 'text-slate-400 hover:text-amber-500'
                        }`}
                        title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mb-2 leading-relaxed">
                      {lang === 'bn' ? site.summaryBn : site.summaryEn}
                    </p>

                    {/* Key Metrics Pill Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
                      <span className={`px-2 py-0.5 rounded-md font-semibold ${
                        site.type === 'hub_facility'
                          ? 'bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                          : site.type === 'agro_zone'
                          ? 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                          : site.type === 'solar_panel'
                          ? 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                          : 'bg-cyan-100/80 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300'
                      }`}>
                        {lang === 'bn' ? site.statusBn : site.statusEn}
                      </span>

                      {site.type === 'hub_facility' && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono">
                          <Cpu className="w-3 h-3 text-indigo-500" />
                          {site.details.connectedSensors} {lang === 'bn' ? 'সেন্সর যুক্ত' : 'Sensors'}
                        </span>
                      )}

                      {site.type === 'agro_zone' && site.details.moisturePercent && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono">
                          <Droplets className="w-3 h-3 text-emerald-500" />
                          {site.details.moisturePercent}% {lang === 'bn' ? 'আর্দ্রতা' : 'Moisture'}
                        </span>
                      )}

                      {site.type === 'solar_panel' && site.details.capacityKwp && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {site.details.capacityKwp} kWp
                        </span>
                      )}

                      {site.type === 'agro_drone' && site.details.batteryPercent && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-mono">
                          <Battery className="w-3 h-3 text-cyan-500" />
                          {site.details.batteryPercent}% {lang === 'bn' ? 'ব্যাটারি' : 'Batt'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Watchlist Tab */
            watchlist.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                <p className="text-xs font-semibold">
                  {lang === 'bn' ? 'আপনার ওয়াচলিস্ট বর্তমানে খালি।' : 'Your agricultural watchlist is empty.'}
                </p>
                <p className="text-[11px] mt-1 text-slate-500">
                  {lang === 'bn' 
                    ? 'যে কোনো ফিল্ড জোন, সোলার অ্যারে বা ড্রোনে স্টার আইকন ক্লিক করে এখানে সংরক্ষণ করুন।' 
                    : 'Click the star icon on any site to keep track of it here.'}
                </p>
              </div>
            ) : (
              watchlist.map((site) => (
                <div
                  key={site.id}
                  onClick={() => {
                    setSelectedSite(site);
                    setMapCenter(site.location);
                    setMapZoom(14);
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-emerald-400 transition-all cursor-pointer relative"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                        {lang === 'bn' ? site.nameBn : site.nameEn}
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        {lang === 'bn' ? `${site.upazilaBn} • ${site.statusBn}` : `${site.upazilaEn} • ${site.statusEn}`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(site);
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                      title={lang === 'bn' ? 'ওয়াচলিস্ট থেকে সরান' : 'Remove from watchlist'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer Statistics */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {lang === 'bn' ? 'টেলিমেট্রি গ্রিড সক্রিয়' : 'Telemetry Grid Online'}
          </span>
          <span className="font-medium">
            {lang === 'bn' ? 'ঠাকুরগাঁও, বাংলাদেশ' : 'Thakurgaon, Bangladesh'}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// Marker Renderer Component
function AgroMarkersRenderer({
  sites,
  selectedSite,
  setSelectedSite,
  watchlist,
  toggleWatchlist,
  isDarkMode,
  showToast,
  lang
}: {
  sites: AgroSite[];
  selectedSite: AgroSite | null;
  setSelectedSite: (site: AgroSite | null) => void;
  watchlist: AgroSite[];
  toggleWatchlist: (site: AgroSite) => void;
  isDarkMode: boolean;
  showToast: (msg: string) => void;
  lang: 'en' | 'bn';
}) {
  const map = useMap();

  return (
    <>
      {sites.map((site) => {
        const isSelected = selectedSite?.id === site.id;

        return (
          <AdvancedMarker
            key={site.id}
            position={site.location}
            title={lang === 'bn' ? site.nameBn : site.nameEn}
            onClick={() => {
              setSelectedSite(site);
              if (map) {
                map.panTo(site.location);
              }
            }}
          >
            <div className="group cursor-pointer select-none">
              {/* Custom Marker Pin */}
              <div className="relative flex flex-col items-center">
                {/* Drone Animated Pulse Radar Wave */}
                {site.type === 'agro_drone' && (
                  <div className="absolute -inset-2.5 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
                )}

                {/* Marker Outer Container */}
                <div className={`p-2 rounded-2xl border-2 shadow-xl transition-all duration-200 ${
                  isSelected 
                    ? 'scale-125 z-50 ring-4 ring-white dark:ring-slate-900 border-white' 
                    : 'group-hover:scale-110 border-white dark:border-slate-800'
                } ${
                  site.type === 'hub_facility'
                    ? 'bg-linear-to-br from-indigo-500 to-purple-700 text-white shadow-indigo-500/30'
                    : site.type === 'agro_zone'
                    ? 'bg-linear-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/30'
                    : site.type === 'solar_panel'
                    ? 'bg-linear-to-br from-amber-400 to-orange-600 text-white shadow-amber-500/30'
                    : 'bg-linear-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/30'
                }`}>
                  {site.type === 'hub_facility' && <Building2 className="w-4 h-4 fill-current/20" />}
                  {site.type === 'agro_zone' && <Sprout className="w-4 h-4 fill-current/20" />}
                  {site.type === 'solar_panel' && <Sun className="w-4 h-4 fill-current/30" />}
                  {site.type === 'agro_drone' && <Plane className="w-4 h-4 fill-current/30" />}
                </div>

                {/* Mini Metric Tag Pill */}
                <div className="mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-tight bg-slate-950/85 text-white backdrop-blur-md shadow-lg border border-white/20 whitespace-nowrap">
                  {site.type === 'hub_facility' && (lang === 'bn' ? 'কন্ট্রোল হাব' : 'Agro Hub')}
                  {site.type === 'agro_zone' && `${site.details.moisturePercent}% ${lang === 'bn' ? 'আর্দ্রতা' : 'Moist'}`}
                  {site.type === 'solar_panel' && `${site.details.capacityKwp} kWp`}
                  {site.type === 'agro_drone' && `${site.details.batteryPercent}% ${lang === 'bn' ? 'ব্যাটারি' : 'Batt'}`}
                </div>
              </div>
            </div>
          </AdvancedMarker>
        );
      })}

      {/* InfoWindow Details Modal when marker is selected */}
      {selectedSite && (
        <InfoWindow
          position={selectedSite.location}
          onCloseClick={() => setSelectedSite(null)}
          pixelOffset={[0, -28]}
          disableAutoPan={false}
        >
          <div 
            className="w-[310px] sm:w-[350px] p-1 font-sans text-slate-900 dark:text-slate-100"
            style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
          >
            {/* Header Badge */}
            <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl text-white ${
                  selectedSite.type === 'hub_facility'
                    ? 'bg-indigo-600'
                    : selectedSite.type === 'agro_zone'
                    ? 'bg-emerald-600'
                    : selectedSite.type === 'solar_panel'
                    ? 'bg-amber-600'
                    : 'bg-cyan-600'
                }`}>
                  {selectedSite.type === 'hub_facility' && <Building2 className="w-4 h-4" />}
                  {selectedSite.type === 'agro_zone' && <Sprout className="w-4 h-4" />}
                  {selectedSite.type === 'solar_panel' && <Sun className="w-4 h-4" />}
                  {selectedSite.type === 'agro_drone' && <Plane className="w-4 h-4" />}
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    selectedSite.type === 'hub_facility'
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : selectedSite.type === 'agro_zone'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : selectedSite.type === 'solar_panel'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-cyan-600 dark:text-cyan-400'
                  }`}>
                    {selectedSite.type === 'hub_facility' 
                      ? (lang === 'bn' ? 'কন্ট্রোল ও গবেষণা হাব' : 'Agro Research Hub')
                      : selectedSite.type === 'agro_zone' 
                      ? (lang === 'bn' ? 'স্মার্ট অ্যাগ্রো জোন' : 'Agro Field Zone') 
                      : selectedSite.type === 'solar_panel' 
                      ? (lang === 'bn' ? 'সোলার এগ্রিভোল্টাইক' : 'Solar Agrivoltaic') 
                      : (lang === 'bn' ? 'স্মার্ট ড্রোন টেলিমিতি' : 'Agro Drone Telemetry')}
                  </span>
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                    {lang === 'bn' ? selectedSite.nameBn : selectedSite.nameEn}
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
              {lang === 'bn' ? selectedSite.summaryBn : selectedSite.summaryEn}
            </p>

            {/* Detailed Metrics Panel */}
            <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
              {selectedSite.type === 'hub_facility' && (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'ক্যাপাসিটি' : 'CAPACITY'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {lang === 'bn' ? selectedSite.details.capacityBn : selectedSite.details.capacityEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'সংযুক্ত সেন্সর' : 'CONNECTED SENSORS'}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {selectedSite.details.connectedSensors} {lang === 'bn' ? 'টি নোড' : 'Active Nodes'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'উপজেলা' : 'UPAZILA'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {lang === 'bn' ? selectedSite.upazilaBn : selectedSite.upazilaEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'পরিবেশ তাপমাত্রা' : 'TEMPERATURE'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedSite.details.temperatureC}°C
                    </span>
                  </div>
                </>
              )}

              {selectedSite.type === 'agro_zone' && (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'ফসল ও পর্যায়' : 'CROP & STAGE'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {lang === 'bn' ? selectedSite.details.cropBn : selectedSite.details.cropEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'মাটির আর্দ্রতা' : 'SOIL MOISTURE'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {selectedSite.details.moisturePercent}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'এনডিভিআই সূচক' : 'NDVI VEGETATION'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedSite.details.ndvi} ({lang === 'bn' ? 'উচ্চ স্বাস্থ্য' : 'Healthy'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'পিএইচ ও এনপিকে' : 'SOIL PH / NPK'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedSite.details.soilPh} pH ({selectedSite.details.npk})
                    </span>
                  </div>
                </>
              )}

              {selectedSite.type === 'solar_panel' && (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'সোলার ক্ষমতা' : 'CAPACITY'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedSite.details.capacityKwp} kWp</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'বর্তমান বিদ্যুৎ' : 'CURRENT OUTPUT'}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{selectedSite.details.currentOutputKw} kW</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'সক্রিয় পাম্প' : 'ACTIVE PUMPS'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedSite.details.pumpsCount} {lang === 'bn' ? 'টি সাবমার্সিবল' : 'Pumps'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'পানি প্রবাহ' : 'WATER FLOW'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedSite.details.flowRateLpm} L/min</span>
                  </div>
                </>
              )}

              {selectedSite.type === 'agro_drone' && (
                <>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'ব্যাটারি লেভেল' : 'BATTERY LEVEL'}</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                      {selectedSite.details.batteryPercent}% {lang === 'bn' ? 'অবশিষ্ট' : 'Left'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'উচ্চতা ও গতি' : 'ALTITUDE / SPEED'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedSite.details.altitudeMeters}m • {selectedSite.details.speedKmh} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'মিশন' : 'MISSION'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {lang === 'bn' ? selectedSite.details.missionBn : selectedSite.details.missionEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{lang === 'bn' ? 'ম্যাপিং এরিয়া' : 'COVERAGE'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {selectedSite.details.coverageHa} {lang === 'bn' ? 'হেক্টর' : 'Ha'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedSite.type === 'hub_facility') {
                    showToast(lang === 'bn' ? `${selectedSite.nameBn}-এর সাথে ডেটা সিঙ্ক সম্পন্ন হয়েছে!` : `Data sync completed for ${selectedSite.nameEn}`);
                  } else if (selectedSite.type === 'agro_zone') {
                    showToast(lang === 'bn' ? `${selectedSite.nameBn}-তে স্মার্ট সেচ চালু করা হয়েছে!` : `Smart irrigation triggered for ${selectedSite.nameEn}`);
                  } else if (selectedSite.type === 'solar_panel') {
                    showToast(lang === 'bn' ? `${selectedSite.nameBn}-এর সোলার পাম্প প্রবাহ নিয়ন্ত্রিত হয়েছে!` : `Pump flow regulated for ${selectedSite.nameEn}`);
                  } else {
                    showToast(lang === 'bn' ? `ড্রোন রিটার্ন-টু-হোম (RTL) কমান্ড পাঠানো হয়েছে!` : `Agro-Drone RTL command sent successfully`);
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all text-center ${
                  selectedSite.type === 'hub_facility'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : selectedSite.type === 'agro_zone'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : selectedSite.type === 'solar_panel'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                {selectedSite.type === 'hub_facility' && (lang === 'bn' ? 'ডেটা সিঙ্ক করুন' : 'Sync Telemetry')}
                {selectedSite.type === 'agro_zone' && (lang === 'bn' ? 'স্মার্ট সেচ চালু করুন' : 'Trigger Irrigation')}
                {selectedSite.type === 'solar_panel' && (lang === 'bn' ? 'পাম্প প্রবাহ অপ্টিমাইজ' : 'Optimize Flow')}
                {selectedSite.type === 'agro_drone' && (lang === 'bn' ? 'ড্রোন ফিরিয়ে আনুন (RTL)' : 'Command Return (RTL)')}
              </button>

              <button
                onClick={() => toggleWatchlist(selectedSite)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  watchlist.some(w => w.id === selectedSite.id)
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
                title={lang === 'bn' ? 'ওয়াচলিস্টে সংরক্ষণ করুন' : 'Save to Watchlist'}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
