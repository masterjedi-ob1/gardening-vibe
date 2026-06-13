import { Header } from "@/components/layout/Header";
import { BedSection } from "@/components/garden/BedSection";
import { SuppliesCard } from "@/components/garden/SuppliesCard";
import { PlantCard } from "@/components/garden/PlantCard";
import { GardenToolbar } from "@/components/garden/GardenToolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createGuestDataClient } from "@/lib/supabase/data";
import { Bed, Plant, Supply } from "@/lib/types";

export const revalidate = 0;

async function getGardenData() {
  // Guest-mode reads via the service-role client — the anon client is blocked by
  // RLS for the seeded (gardener_id NULL) garden. See lib/supabase/data.ts.
  const supabase = createGuestDataClient();

  const [plantsRes, bedsRes, suppliesRes] = await Promise.all([
    supabase
      .from("plants")
      .select("*")
      .order("type")
      .order("name"),
    supabase
      .from("beds")
      .select("*")
      .order("name"),
    supabase
      .from("supplies")
      .select("*")
      .order("item"),
  ]);

  return {
    plants: (plantsRes.data ?? []) as Plant[],
    beds: (bedsRes.data ?? []) as Bed[],
    supplies: (suppliesRes.data ?? []) as Supply[],
  };
}

export default async function GardenPage() {
  let plants: Plant[] = [];
  let beds: Bed[] = [];
  let supplies: Supply[] = [];
  let error: string | null = null;

  try {
    ({ plants, beds, supplies } = await getGardenData());
  } catch {
    error = "Could not load garden data — check your Supabase connection.";
  }

  // Group plants by bed
  const planted = plants.filter((p) => p.status !== "wishlist");
  const wishlist = plants.filter((p) => p.status === "wishlist");

  const bedsWithPlants = beds.map((bed) => ({
    ...bed,
    plants: planted.filter((p) => p.bed_id === bed.id),
  }));

  const unassigned = planted.filter((p) => !p.bed_id);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 space-y-8 flex-1">

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Your Garden</h1>
            <p className="text-stone-500 text-sm mt-1">Summer 2026 · Chris &amp; Bill</p>
          </div>
          <GardenToolbar beds={beds} />
        </div>

        {error && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            {error}
          </div>
        )}

        <Tabs defaultValue="beds">
          <TabsList>
            <TabsTrigger value="beds">By Bed</TabsTrigger>
            <TabsTrigger value="all">All Plants</TabsTrigger>
            <TabsTrigger value="supplies">Supplies</TabsTrigger>
          </TabsList>

          {/* BED VIEW */}
          <TabsContent value="beds" className="space-y-8">
            {bedsWithPlants.map((bed) => (
              <BedSection key={bed.id} bed={bed} beds={beds} editable />
            ))}

            {unassigned.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-semibold text-stone-600 text-sm">Unassigned plants</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {unassigned.map((p) => <PlantCard key={p.id} plant={p} beds={beds} editable />)}
                </div>
              </section>
            )}

            {wishlist.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-semibold text-stone-600 text-sm">Wishlist 🌠</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {wishlist.map((p) => <PlantCard key={p.id} plant={p} beds={beds} editable />)}
                </div>
              </section>
            )}

            {bedsWithPlants.length === 0 && planted.length === 0 && !error && (
              <div className="text-center py-16 text-stone-400 space-y-2">
                <div className="text-4xl">🌱</div>
                <p>No plants yet. Your garden is waiting to grow.</p>
              </div>
            )}
          </TabsContent>

          {/* ALL PLANTS VIEW */}
          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plants.map((p) => <PlantCard key={p.id} plant={p} beds={beds} editable />)}
            </div>
            {plants.length === 0 && !error && (
              <p className="text-center py-16 text-stone-400">No plants yet.</p>
            )}
          </TabsContent>

          {/* SUPPLIES VIEW */}
          <TabsContent value="supplies">
            {supplies.length > 0 ? (
              <SuppliesCard supplies={supplies} />
            ) : (
              <p className="text-center py-16 text-stone-400">No supplies recorded yet.</p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
