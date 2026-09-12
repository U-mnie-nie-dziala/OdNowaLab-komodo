import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet } from 'react-native';

import { companiesApi } from '@/api/companies';
import { servicesApi } from '@/api/services';
import { CompanyDto, ServiceDto } from '@/api/types';
import { Badge } from '@/components/badge';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { Collapsible } from '@/components/ui/collapsible';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export default function BusinessesScreen() {
  const [companies, setCompanies] = useState<CompanyDto[] | null>(null);
  const [servicesByCompany, setServicesByCompany] = useState<Map<number, ServiceDto[]>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [companyList, serviceList] = await Promise.all([companiesApi.getAll(), servicesApi.getAll()]);
    const grouped = new Map<number, ServiceDto[]>();
    for (const service of serviceList) {
      if (service.providerId == null) continue;
      const existing = grouped.get(service.providerId) ?? [];
      existing.push(service);
      grouped.set(service.providerId, existing);
    }
    setServicesByCompany(grouped);
    setCompanies(
      [...companyList].sort((a, b) => Number(b.isInRevitalizationZone) - Number(a.isInRevitalizationZone))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  return (
    <Screen refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
      <ThemedText type="title" style={styles.title}>
        Przedsiębiorstwa
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Firmy oznaczone jako &quot;Strefa rewitalizacji&quot; naliczają punkty za zakupy.
      </ThemedText>

      {companies === null && (
        <ThemedText type="small" themeColor="textSecondary">
          Wczytywanie…
        </ThemedText>
      )}

      {companies?.map((company) => {
        const offers = servicesByCompany.get(company.id) ?? [];
        return (
          <Card key={company.id}>
            <ThemedText type="smallBold">{company.name}</ThemedText>
            <Badge
              label={company.isInRevitalizationZone ? 'Strefa rewitalizacji' : 'Poza strefą'}
              tone={company.isInRevitalizationZone ? 'positive' : 'neutral'}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {company.description}
            </ThemedText>

            {offers.length > 0 && (
              <Collapsible title={`Oferty (${offers.length})`}>
                {offers.map((offer) => (
                  <ThemedText key={offer.id} type="small" style={styles.offerRow}>
                    {offer.name} — {offer.coinCost} pkt
                  </ThemedText>
                ))}
              </Collapsible>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  offerRow: {
    paddingVertical: Spacing.half,
  },
});
