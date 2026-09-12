import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { companiesApi } from '@/api/companies';
import { CompanyDto } from '@/api/types';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Brand, Neutral, Spacing } from '@/constants/theme';

export default function MapScreen() {
  const [companies, setCompanies] = useState<CompanyDto[] | null>(null);

  const load = useCallback(async () => {
    setCompanies(await companiesApi.getAll());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mapRegion: Region | undefined = useMemo(() => {
    if (!companies || companies.length === 0) return undefined;
    const lats = companies.map((c) => c.locationX);
    const lngs = companies.map((c) => c.locationY);
    return {
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitudeDelta: Math.max(Math.max(...lats) - Math.min(...lats), 0.02) * 1.8,
      longitudeDelta: Math.max(Math.max(...lngs) - Math.min(...lngs), 0.02) * 1.8,
    };
  }, [companies]);

  return (
    <Screen scroll={false}>
      <ThemedText type="pageHeader">Mapa firm</ThemedText>

      <Card style={styles.mapCard}>
        {mapRegion ? (
          <MapView style={styles.map} initialRegion={mapRegion}>
            {companies?.map((company) => (
              <Marker
                key={company.id}
                coordinate={{ latitude: company.locationX, longitude: company.locationY }}
                title={company.name}
                description={company.isInRevitalizationZone ? 'Strefa rewitalizacji' : 'Poza strefą'}
                pinColor={company.isInRevitalizationZone ? Brand[600] : Neutral[500]}
              />
            ))}
          </MapView>
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.loadingText}>
            Wczytywanie mapy…
          </ThemedText>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  loadingText: {
    padding: Spacing.three,
  },
});
