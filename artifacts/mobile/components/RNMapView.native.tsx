import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";

import type { Coordinates, RouteResult } from "@/services/mapbox";

type Props = {
  mapRef: React.RefObject<MapView | null>;
  originCoords: Coordinates | null;
  destCoords: Coordinates | null;
  route: RouteResult | null;
  userLocation: Coordinates | null;
  hasLocationPermission: boolean;
};

const DEFAULT_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function RNMapView({
  mapRef,
  originCoords,
  destCoords,
  route,
  userLocation,
  hasLocationPermission,
}: Props) {
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_DEFAULT}
      initialRegion={
        userLocation
          ? { ...userLocation, latitudeDelta: 0.1, longitudeDelta: 0.1 }
          : DEFAULT_REGION
      }
      showsUserLocation={hasLocationPermission}
      showsMyLocationButton={false}
      showsTraffic={true}
      mapType="standard"
    >
      {originCoords && (
        <Marker coordinate={originCoords} title="Origin">
          <MarkerPin label="A" color="#00D4FF" />
        </Marker>
      )}
      {destCoords && (
        <Marker coordinate={destCoords} title="Destination">
          <MarkerPin label="B" color="#FF3B30" />
        </Marker>
      )}
      {route && (
        <Polyline
          coordinates={route.coordinates}
          strokeColor="#00D4FF"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
}

import { Text, View } from "react-native";
function MarkerPin({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: color, alignItems: "center", justifyContent: "center",
        borderWidth: 2, borderColor: "#fff",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </View>
  );
}
