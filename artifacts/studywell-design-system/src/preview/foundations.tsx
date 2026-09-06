import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Guidelines } from './parts';

const CORE_SWATCHES = [
  { name: 'Primary', className: 'bg-primary' },
  { name: 'Secondary', className: 'bg-secondary' },
  { name: 'Accent', className: 'bg-accent' },
] as const;

const SUPPORTING_SWATCHES = [
  { name: 'Background', className: 'border bg-background' },
  { name: 'Foreground', className: 'bg-foreground' },
  { name: 'Muted', className: 'bg-muted' },
  { name: 'Destructive', className: 'bg-destructive' },
  { name: 'Border', className: 'bg-border' },
] as const;

const TYPE_SCALE = [
  { label: 'Display', className: 'text-4xl font-bold' },
  { label: 'Heading', className: 'text-2xl font-semibold' },
  { label: 'Body', className: 'text-base' },
  { label: 'Label', className: 'text-sm font-medium' },
  { label: 'Caption', className: 'text-sm text-muted-foreground' },
] as const;

const SPACING_SCALE = [
  { label: '4', className: 'w-4' },
  { label: '8', className: 'w-8' },
  { label: '12', className: 'w-12' },
  { label: '16', className: 'w-16' },
  { label: '24', className: 'w-24' },
] as const;

function Swatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-lg ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

export function OverviewPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Core palette
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ink &amp; Marigold principles
        </h2>
        <div className="mt-4">
          <Guidelines
            items={[
              { kind: 'do', text: 'Let warm parchment surfaces and deep teal structure do most of the visual work.' },
              { kind: 'do', text: 'Use marigold for focus, progress, and the next meaningful action.' },
              { kind: 'dont', text: 'Add heavy shadows or saturated decoration to calm productivity surfaces.' },
            ]}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Typography
          </h2>
          <div className="mt-4 space-y-3">
            {TYPE_SCALE.map((entry) => (
              <p key={entry.label} className={entry.className}>
                {entry.label}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            In use
          </h2>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Create workspace</CardTitle>
              <CardDescription>
                Components composed from the tokens above.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="overview-name">Workspace name</Label>
                <Input id="overview-name" placeholder="Enter a name" />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked id="overview-notify" />
                <Label htmlFor="overview-notify">Email notifications</Label>
                <Badge className="ml-auto">New</Badge>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>Save</Button>
              <Button variant="outline">Cancel</Button>
            </CardFooter>
          </Card>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Components
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Brand colors</h2>
          <p className="text-sm text-muted-foreground">
            The core roles used for emphasis, supporting actions, and accents.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CORE_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Semantic and surface colors</h2>
          <p className="text-sm text-muted-foreground">
            Roles for text, backgrounds, borders, muted content, and danger.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {SUPPORTING_SWATCHES.map((swatch) => (
            <Swatch key={swatch.name} {...swatch} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function FontsPage() {
  return (
    <div className="space-y-8 rounded-xl border bg-card p-6 text-card-foreground">
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Font family
        </h2>
        <p className="mt-4 text-4xl font-bold">The quick brown fox</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The token font family is applied across this entire preview.
        </p>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Type scale
        </h2>
        {TYPE_SCALE.map((entry) => (
          <div key={entry.label} className="grid gap-2 sm:grid-cols-[88px_1fr]">
            <span className="pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {entry.label}
            </span>
            <p className={entry.className}>Build products people understand.</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export function LayoutPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Spacing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The spacing scale, derived from the base spacing token.
        </p>
        <div className="mt-6 space-y-4">
          {SPACING_SCALE.map((space) => (
            <div key={space.label} className="flex items-center gap-4">
              <span className="w-8 text-xs text-muted-foreground">
                {space.label}
              </span>
              <div className={`h-3 rounded-full bg-primary ${space.className}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 text-card-foreground">
        <h2 className="font-semibold">Radius</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Corner treatments derive from the base radius token.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            { label: 'Small', className: 'rounded-sm' },
            { label: 'Medium', className: 'rounded-md' },
            { label: 'Large', className: 'rounded-lg' },
            { label: 'Extra large', className: 'rounded-xl' },
          ].map((radius) => (
            <div
              key={radius.label}
              className={`flex h-24 items-end border bg-muted p-3 ${radius.className}`}
            >
              <span className="text-xs font-medium">{radius.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function BrandPage() {
  return (
    <div className="space-y-6">
      <section className="soft-grid rounded-2xl border bg-card p-8 text-card-foreground">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
          Studywell
        </p>
        <h2 className="mt-4 font-display text-5xl font-semibold tracking-tight">
          Ink &amp; Marigold
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          A calm academic workspace with editorial warmth, grounded structure,
          and just enough color to make progress visible.
        </p>
      </section>
      <section className="rounded-2xl border bg-card p-6 text-card-foreground">
        <h2 className="font-display text-2xl font-semibold">Brand voice</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Write like a thoughtful study partner: direct, encouraging, and
          specific. Prefer “Keep the thread going” over generic productivity
          language.
        </p>
      </section>
    </div>
  );
}

export function MotionPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 text-card-foreground">
        <h2 className="font-display text-2xl font-semibold">Quiet momentum</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use short upward reveals to establish hierarchy without distracting
          from the work.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {['enter', 'enter-2', 'enter-3'].map((className, index) => (
            <div
              key={className}
              className={`${className} rounded-2xl border bg-muted p-5`}
            >
              <span className="font-data text-xs text-muted-foreground">
                0{index + 1}
              </span>
              <p className="mt-8 font-semibold">{className}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-6 text-card-foreground">
        <Guidelines
          items={[
            { kind: 'do', text: 'Stagger related content groups by a small, predictable delay.' },
            { kind: 'dont', text: 'Animate every control independently or make a dashboard feel busy.' },
          ]}
        />
      </section>
    </div>
  );
}

export function AppliedExamplesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 text-card-foreground">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
          Dashboard composition
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
            <p className="text-xs uppercase tracking-wide opacity-70">Attendance</p>
            <p className="mt-5 font-data text-3xl">82%</p>
          </div>
          <div className="rounded-2xl border bg-muted p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Focus today</p>
            <p className="mt-5 font-display text-2xl font-semibold">25 min</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Next</p>
            <p className="mt-5 font-semibold">Review notes</p>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-6 text-card-foreground">
        <Guidelines
          items={[
            { kind: 'do', text: 'Pair one high-emphasis metric with quieter supporting cards.' },
            { kind: 'do', text: 'Use mono numerals for values that students compare or scan.' },
            { kind: 'dont', text: 'Turn every metric into a competing headline.' },
          ]}
        />
      </section>
    </div>
  );
}
