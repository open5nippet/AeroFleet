import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import type { Coordinates, RouteResult } from "@/services/mapbox";

const C = Colors.light;
const MAPBOX_KEY = process.env.EXPO_PUBLIC_MAPBOX_KEY ?? "";

type Props = {
  mapRef?: React.RefObject<any>;
  originCoords: Coordinates | null;
  destCoords: Coordinates | null;
  route: RouteResult | null;
  userLocation?: Coordinates | null;
  hasLocationPermission?: boolean;
};

function buildStaticUrl(origin: Coordinates | null, dest: Coordinates | null): string | null {
  if (!origin && !dest) return null;
  const markers: string[] = [];
  if (origin) markers.push(`pin-l-a+00D4FF(${origin.longitude},${origin.latitude})`);
  if (dest) markers.push(`pin-l-b+FF3B30(${dest.longitude},${dest.latitude})`);
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${markers.join(",")}/auto/640x360@2x?access_token=${MAPBOX_KEY}&padding=60`;
}

export default function RNMapView({ originCoords, destCoords, route }: Props) {
  const mapUrl = buildStaticUrl(originCoords, destCoords);

  if (!mapUrl) {
    return (
      <View style={[styles.placeholder, { backgroundColor: C.backgroundElevated }]}>
        <Text style={[styles.placeholderText, { color: C.textMuted }]}>
          Enter locations to see map
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: mapUrl }} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: "100%" },
  image: { width: "100%", height: "100%" },
  placeholder: {
    width: "100%", height: "100%",
    alignItems: "center", justifyContent: "center",
    borderRadius: 18,
  },
  placeholderText: { fontSize: 13 },
});
