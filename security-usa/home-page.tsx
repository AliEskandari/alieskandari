import CEOImage from "@/app/(content)/company/letter-from-ceo/image-ceo.png";
import Button from "@/components/buttons/button";
import VideoButton from "@/components/buttons/video-button";
import BbbPng from "@/components/footer/image-bbb.png";
import NtasPng from "@/components/footer/image-ntas.png";
import ContactForm, { ContactFormProps } from "@/components/forms/contact-form";
import Hero from "@/components/hero/hero";
import MaxWContainer from "@/components/max-w-container/max-w-container";
import { NavItemGroup } from "@/components/navbar/nav-items";
import ShieldCheck from "@/public/assets/icons/shield-check.svg";
import type { Metadata } from "next";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import AppTemplate from "./app-template";
import "./globals.css";
import YearsPng from "./image-20-years.png";
import IndustriesWeServe from "./image-industries-we-serve.png";
import OurSecurityDivisionsImage from "./image-our-security-divisions.png";
import SecurityServices from "./image-security-services.png";
import SecuritySystems from "./image-security-systems.png";
import TriStateImage from "./image-tri-state.png";
import VideoCover2 from "./image-video-cover-2.png";
import VideoCover from "./image-video-cover.png";
import { routes } from "@/modules/routes/routes";

export const metadata: Metadata = {
  title: "New York Licensed Security Services Company",
  description:
    "Security USA leader among New York Security Guard Companies for our outstanding security guard service, security systems and surveillance",
  keywords:
    "security guard companies, security systems, security services, security service, security jobs, securitas, security guard services, guard, security guard service, security services, security service, Long Island security, new york security, security services, commercial security guards, private security companies, executive protection, security solution",
};

type Section = {
  title: string;
  description: ReactNode;
  items?: NavItemGroup["items"];
  image?: StaticImageData;
};

const FeatureSections: Section[] = [
  {
    title: "Security Services",
    description: "New York, New Jersey, and Florida Security Services.",
    items: [
      {
        name: "Security Guards and Patrols",
        href: routes.services.securityGuards.href,
      },
      { name: "Cyber Security", href: routes.services.cyberSecurity.href },
      {
        name: "Fire Guards / Fire Safety",
        href: routes.services.fireGuards.href,
      },
      {
        name: "Doorman & Concierge",
        href: routes.services.doormanConcierge.href,
      },
      {
        name: "Executive / VIP Protection",
        href: routes.services.executiveProtection.href,
      },
      {
        name: "Armed Executive Protection",
        href: routes.services.armedExecutiveProtection.href,
      },
      {
        name: "Consulting / Risk Assessment",
        href: routes.services.securityConsulting.href,
      },
      {
        name: "Private Investigations",
        href: routes.services.privateInvestigations.href,
      },
      { name: "Background Check", href: routes.services.backgroundCheck.href },
      {
        name: "Special Event Security",
        href: routes.services.specialEvents.href,
      },
      {
        name: "Quality Assurance",
        href: routes.services.qualityAssurance.href,
      },
      {
        name: "Neighborhood Watch",
        href: routes.services.neighborhoodWatch.href,
      },
      {
        name: "Building Maintenance",
        href: routes.services.buildingMaintenance.href,
      },
    ],
    image: SecurityServices,
  },
  {
    title: "Security Systems",
    description:
      "24/7 through our extensive CCTV (closed-circuit television) system. Watched by our field supervisors and highly-trained command center operators, our command center provides an additional layer of security and supervision for your property.",
    items: [
      {
        name: "Central Monitoring Control",
        href: routes.securitySystems.centralMonitoringControl.href,
      },
      {
        name: "CCTV/Access Systems",
        href: routes.securitySystems.cctvAccess.href,
      },
      {
        name: "Guard Management System",
        href: routes.securitySystems.guardManagementSystem.href,
      },
      {
        name: "Facial Recognition",
        href: routes.securitySystems.facialRecognition.href,
      },
    ],
    image: SecuritySystems,
  },
  {
    title: "Industries We Serve",
    description:
      "We offer security solutions across a wide variety of industries.",
    items: [
      {
        name: "Residential Building Security",
        href: routes.industries.residentialBuildingSecurity.href,
      },
      {
        name: "Offices & Commercial Buildings",
        href: routes.industries.officesCommercialBuildings.href,
      },
      {
        name: "Gated Communities Security",
        href: routes.industries.homeownersAssociations.href,
      },
      {
        name: "Hospitals and Medical Facilities",
        href: routes.industries.hospitalsMedicalFacilities.href,
      },
      {
        name: "Construction Site Security",
        href: routes.industries.constructionSiteSecurity.href,
      },
      {
        name: "Educational Institutions",
        href: routes.industries.schoolSecurity.href,
      },
      {
        name: "Non-Profit Organizations (NFP)",
        href: routes.industries.nonProfitOrganizations.href,
      },
      {
        name: "Consulates & Embassies",
        href: routes.industries.consulatesEmbassies.href,
      },
      {
        name: "Retail Stores & Shopping Malls",
        href: routes.industries.retailStores.href,
      },
      {
        name: "Industrial & Manufacturing",
        href: routes.industries.industrialManufacturing.href,
      },
      {
        name: "Hospitality Industry",
        href: routes.industries.hospitalityIndustry.href,
      },
      {
        name: "Banking & Finance",
        href: routes.industries.bankingFinance.href,
      },
      {
        name: "Houses of Worship & Religious Institutions",
        href: routes.industries.housesOfWorship.href,
      },
    ],
    image: IndustriesWeServe,
  },
];

const LetterFromCEOSection: Section = {
  title: "Letter From CEO",
  description: (
    <div className="flex flex-col gap-y-4">
      <p>Dear Client,</p>
      <p>
        Security is a serious issue. Both on a personal and on a business level,
        security and protection are ongoing concerns. Providing a safe
        environment is necessary to maximize security and protect against
        liability.
      </p>
      <p>
        Security USA®'s focus is on innovation, performance, customer service
        and value. Our leadership has the combined experience of over 60 years
        of security protection, military and police training. We listen to
        clients, keep abreast of technological innovations, and provide trained,
        experienced individuals to achieve your personal and commercial security
        goals. Security USA® is the number one choice for individuals,
        corporate executives, commercial and residential property owners, retail
        stores, infrastructure builders, schools and organizations across the
        country.
      </p>
      <Button
        as="Link"
        href={routes.company.letter.href}
        variant="primary"
        className="w-fit"
      >
        Read More
      </Button>
    </div>
  ),
  image: CEOImage,
};

const OurSecurityDivisionsSection: Section = {
  title: "Our Security Divisions",
  description:
    "Our mission is to be a valuable partner in your operations and to go that extra mile",
  items: [
    {
      name: "Commercial Services Division",
      href: routes.divisions.commercial.href,
    },
    {
      name: "Residential Services Division",
      href: routes.divisions.residential.href,
    },
    { name: "Retail Loss Prevention", href: routes.divisions.retail.href },
    { name: "Special Services Division", href: routes.divisions.special.href },
    { name: "Technology Division", href: routes.divisions.technology.href },
    {
      name: "Risk Assessment Division",
      href: routes.divisions.riskAssessment.href,
    },
    { name: "Construction Sites", href: routes.divisions.construction.href },
  ],
  image: OurSecurityDivisionsImage,
};

const TriStateSection: Section = {
  title: "New York, New Jersey, Florida, Security Services & Security Systems",
  description: (
    <div className="flex flex-col gap-y-4">
      <p>
        If you're looking for the best security guard company, recognized as a
        security service leader among New York Security Companies, consider
        Security USA®. We serve organizations throughout the tri-state area and
        beyond, and we use proven strategies to design reliable security
        programs, surveillance and security services for any person or location.
        Security USA, Inc. is a certified security vendor for the department of
        environmental protection.
      </p>
      <p>
        Expert risk assessment, hands-on management and trained staff can
        provide the safety and security service that are right for you.
        State-of-the-art technology and exceptional customer service combine to
        provide top-notch security solutions. Our personal security division
        includes a broad range of protective services, surveillance, other
        security systems, and VIP and executive protection. Our security guards
        are trained to blend in or stand out, as your needs require. We are also
        a leader in security jobs for New York, Long Island, Florida, New
        Jersey.
      </p>
    </div>
  ),
  image: TriStateImage,
};

const OurServices: Section = {
  title:
    "The Following Security Services are among the many security solutions that we offer:",
  description: (
    <div className="flex flex-col gap-y-4">
      <p>
        Members of our security guard team, who have many years of field
        experience protecting people and property, lead our private security
        guard company. The CEO is also personally involved in each project. We
        take pride in our evaluation and implementation process, as well as our
        ability to respond to continuously changing needs as they arise.
      </p>
      <p>
        Join our many satisfied clients throughout the tri-state area-including
        Manhattan, Brooklyn, Queens, the Bronx, Staten Island, Long Island,
        South Florida, New Jersey and beyond.
      </p>
    </div>
  ),
  items: [
    {
      name: "Suffolk County Security Guards",
      href: routes.areasWeServe.newYork.suffolkCounty.href,
    },
    {
      name: "Nassau County Security Guards",
      href: routes.areasWeServe.newYork.nassauCounty.href,
    },
    {
      name: "Westchester County Security Guards",
      href: routes.areasWeServe.newYork.westchesterCounty.href,
    },
    {
      name: "Greene County Security Guards",
      href: routes.areasWeServe.newYork.greeneCounty.href,
    },
    {
      name: "Orange County Security Guards",
      href: routes.areasWeServe.newYork.orangeCounty.href,
    },
    {
      name: "Rockland County Security Guards",
      href: routes.areasWeServe.newYork.rocklandCounty.href,
    },
    {
      name: "Ulster County Security Guards",
      href: routes.areasWeServe.newYork.ulsterCounty.href,
    },
    {
      name: "Staten Island Security Guards",
      href: routes.areasWeServe.newYork.statenIsland.href,
    },
    {
      name: "Long Island Security Guard Service",
      href: routes.services.securityGuards.href,
    },
    {
      name: "Advanced surveillance and access technology",
      href: routes.securitySystems.cctvAccess.href,
    },
    {
      name: "Residential and commercial security services",
      href: routes.services.securityGuards.href,
    },
    {
      name: "All-in-one security consulting",
      href: routes.services.securityConsulting.href,
    },
    {
      name: "Customized security programs for individuals, compoanies, and non-profit organizations",
      href: routes.services.securityConsulting.href,
    },
    {
      name: "On-site security assessments",
      href: routes.divisions.riskAssessment.href,
    },
    { name: "Home security systems", href: routes.securitySystems.href },
    { name: "Bodyguards", href: routes.services.securityGuards.href },
    {
      name: "Surveillance",
      href: routes.securitySystems.centralMonitoringControl.href,
    },
  ],
};

export default function Home() {
  return (
    <AppTemplate>
      <main className="">
        <Hero />
        <section>
          <div className="max-w-7xl mx-auto flex flex-col py-20 gap-y-20 px-6">
            <div
              data-name="row-1"
              className="flex flex-col md:flex-row justify-between gap-x-10 gap-y-12"
            >
              <h1 className="text-4xl font-bold text-oxfordblue w-full md:w-1/2">
                A Licensed & Bonded Security Services Company
              </h1>
              <div
                data-name="badges"
                className="w-full md:w-1/2 flex justify-between gap-x-6"
              >
                <div className="">
                  <Image
                    className="object-contain"
                    alt="ntas"
                    src={NtasPng}
                    sizes={
                      "(max-width: 750px) 50vw, (max-width: 1280px) 16vw, 176px"
                    }
                  />
                </div>

                <Link
                  className=""
                  href={
                    "https://www.bbb.org/us/ny/new-york/profile/security-guards/security-usa-inc-0121-136237/"
                  }
                >
                  <Image
                    className="object-contain"
                    alt="bbb"
                    src={BbbPng}
                    sizes={
                      "(max-width: 750px) 50vw, (max-width: 1280px) 16vw, 176px"
                    }
                  />
                </Link>

                <div className="">
                  <Image
                    className="object-contain"
                    alt="20-years"
                    src={YearsPng}
                    sizes={
                      "(max-width: 750px) 50vw, (max-width: 1280px) 16vw, 176px"
                    }
                  />
                </div>
              </div>
            </div>

            <div
              data-name="row-2"
              className="flex flex-col md:flex-row justify-between gap-x-10 gap-y-12"
            >
              <VideoButton
                className="w-full md:w-1/2"
                videoUrl="https://www.youtube.com/embed/6-5iyZXoXDc?si=lzwadiD6VU17jBaG"
                imageProps={{
                  src: VideoCover,
                  alt: "security-usa-video",
                }}
              />
              <div className="text-oxfordblue w-full md:w-1/2 flex flex-col gap-y-4">
                <p>
                  Security USA® has decades of experience in providing our
                  clients with unparalleled security solutions.
                </p>
                <p>
                  We are a licensed and bonded New York, New Jersey and Florida
                  security company with the vision, the mission and the methods
                  to assess your needs and deliver your security service.
                </p>
                <p>
                  Our original goal was addressing the unmet security needs of
                  commercial, residential, institutional and individual clients
                  who recognize that today's security needs cannot be met by
                  traditional 'rent-a-guard” services. We use proven strategies
                  to design reliable security programs tailored to meet the
                  needs of specific individuals, groups, companies, and/or
                  locations. We serve organizations throughout the tri-state
                  area and beyond.
                </p>
              </div>
            </div>
          </div>
        </section>
        <MaxWContainer
          containerClassName="bg-ghostwhite"
          className="flex flex-col py-20 gap-y-20"
        >
          {FeatureSections.map((section, index) => (
            <Section key={index} section={section} flip={index % 2 == 1} />
          ))}
        </MaxWContainer>
        <MaxWContainer
          containerClassName="bg-white"
          className="flex flex-col py-20 gap-y-20"
        >
          <Section section={LetterFromCEOSection} flip />
        </MaxWContainer>
        <VideoSection />
        <MaxWContainer
          containerClassName="bg-white"
          className="flex flex-col py-20 gap-y-20"
        >
          <Section section={OurSecurityDivisionsSection} flip />
        </MaxWContainer>
        <section className="bg-white">
          <div
            data-name="section-body"
            className="max-w-7xl mx-auto flex flex-col pt-20 pb-10 gap-y-20 px-6 border-t"
          >
            <Section
              section={TriStateSection}
              flip
              classNames={{
                container: "items-start ",
                imageContainer: "w-full md:w-1/2",
                textContainer: "w-full md:w-1/2",
              }}
            />
          </div>
        </section>
        <section className="bg-white px-6">
          <div
            data-name="section-body"
            className="max-w-7xl mx-auto flex flex-col gap-y-12 py-8 px-8 border mb-20"
          >
            <h1 className="text-2xl md:text-3xl font-bold font-serif w-full md:w-9/12">
              {OurServices.title}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
              {OurServices.items?.map((item, index) => (
                <Button
                  as="Link"
                  key={index}
                  variant="outline"
                  href={item.href}
                  className="w-fit flex items-start md:items-center gap-x-2 p-0 font-bold"
                >
                  <Image
                    alt="shield-check"
                    src={ShieldCheck}
                    className="size-6 flex-none"
                  />
                  {item.name}
                </Button>
              ))}
            </div>
            <div className="w-full md:w-9/12">{OurServices.description}</div>
          </div>
        </section>
        <ContactSection variant="dark" />
      </main>
    </AppTemplate>
  );
}

type SectionProps = {
  section: Section;
  classNames?: {
    container?: string;
    imageContainer?: string;
    textContainer?: string;
    image?: string;
    title?: string;
    description?: string;
    items?: string;
  };
  flip?: boolean;
};

function Section({ section, flip, classNames }: SectionProps) {
  return (
    <div
      data-name={section.title.toLowerCase().replace(" ", "-")}
      className={twMerge(
        "flex flex-col gap-x-12 gap-y-12 items-center",
        flip ? "md:flex-row" : "md:flex-row-reverse",
        classNames?.container
      )}
    >
      <div className={twMerge("w-full md:w-1/3", classNames?.imageContainer)}>
        <Image
          className={twMerge("object-contain w-full", classNames?.image)}
          alt={section.title}
          src={section.image ?? ""}
          sizes={"(max-width: 750px) 100vw, (max-width: 1280px) 42vw, 592px"}
        />
      </div>
      <div
        className={twMerge(
          "w-full md:w-2/3 flex flex-col gap-y-4 text-oxfordblue text-base",
          classNames?.textContainer
        )}
      >
        <h1 className="text-4xl font-bold font-serif">{section.title}</h1>
        <h3 className="mb-4 text-lg">{section.description}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.items?.map((item, index) => (
            <Button
              as="Link"
              href={item.href}
              key={index}
              variant="outline"
              className="w-fit flex items-center gap-x-2 p-0 text-lg font-bold"
            >
              <Image alt="shield-check" src={ShieldCheck} className="size-6" />
              {item.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VideoSection() {
  return (
    <MaxWContainer
      containerClassName="bg-oxfordblue text-white text-center"
      className="max-w-4xl flex flex-col py-20"
    >
      <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4">
        SECURITY USA, INC
      </h1>
      <h2 className="text-2xl md:text-3xl font-serif mb-10">
        Decades of experience in providing our clients with unparalleled
        security services
      </h2>
      <VideoButton
        className="w-full"
        videoUrl="https://www.youtube.com/embed/6-5iyZXoXDc?si=lzwadiD6VU17jBaG"
        imageProps={{
          src: VideoCover2,
          alt: "security-usa-video",
        }}
      />
    </MaxWContainer>
  );
}

type ContactSectionProps = {
  variant?: keyof typeof variants;
};

const variants: Record<
  string,
  {
    containerClassName: string;
    bodyClassname: string;
    formVariant: ContactFormProps["variant"];
  }
> = {
  dark: {
    containerClassName: "bg-oxfordblue text-white",
    bodyClassname: "text-white",
    formVariant: "light",
  },
  light: {
    containerClassName: "bg-ghostwhite text-oxfordblue",
    bodyClassname: "text-oxfordblue",
    formVariant: "dark",
  },
} as const;

export function ContactSection({ variant }: ContactSectionProps) {
  const variantProps = variants[variant ?? "light"];
  return (
    <MaxWContainer
      className={twMerge(
        "max-w-5xl flex flex-col md:flex-row py-20 px-6 gap-x-12 gap-y-12",
        variantProps.bodyClassname
      )}
      containerClassName={twMerge(
        "bg-oxfordblue text-white text-center",
        variantProps.containerClassName
      )}
      id="contact-form-section"
    >
      <ContactForm
        className={twMerge("w-full md:w-1/2")}
        variant={variantProps.formVariant}
      />
      <div className="w-full md:w-1/2 text-start flex flex-col gap-y-6">
        {[
          {
            title: "New York (HQ)",
            description: (
              <>
                336 West 37th Street, Suite 450, New York, NY 10018 <br />
                <a href="tel:2125944475">Tel: 212-594-4475</a>
              </>
            ),
          },
          {
            title: "Long Island",
            description: (
              <>
                535 Broadhollow Rd, M-107, Melville NY 11747 <br />
                <a href="tel:6314147513">Tel: 631-414-7513</a>
              </>
            ),
          },
          {
            title: "Florida",
            description: (
              <>
                501 Golden Isles Dr, Suite 204, Hallandale Beach, FL 33009
                <br />
                <a href="tel:7866888200">Tel: 786-688-8200</a>
              </>
            ),
          },
          {
            title: "New Jersey",
            description: (
              <>
                820 Bear Tavern Rd, West Trenton, NJ 08628 <br />
                <a href="tel:2015153028">Tel: 201-515-3028</a>
              </>
            ),
          },
          {
            title: "Nationwide",
            description: (
              <>
                <a href="tel:18664827380">Tel: 866-GUARD-80</a>
              </>
            ),
          },
        ].map((item, index) => (
          <div>
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-line border-l-2 border-goldenrod p-2">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </MaxWContainer>
  );
}
