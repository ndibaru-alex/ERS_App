
import { Card, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link ,useNavigate} from 'react-router-dom' // or next/link, whichever router you’re using
import { UserPlus, Activity, ShieldCheck } from 'lucide-react'
import { HomeSearch } from './Home-search';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  
 const Process = [
  {
    question: "Personal Information",
    answer:
      "SignUp and Upload your Documents ",
  },
  {
    question: "Upload Your Documents ",
    answer:
      "Upload CV ID In Pdf format.",
  },
  {
    question: "Employment History",
    answer:
      "Give your Employment History.",
  },
  {
    question: "Languages ",
    answer:
      "Provide all the Languages You speak.",
  },
  {
    question: "Application Tracking  ",
    answer:
      "Track how your Application is going Through",
  },
];



const cards = [
  {
    title: 'Easy Registration',
    description: 'Simple and straightforward registration process for all applicants.',
    buttonText: 'Register Now',
    link: '/register',
    icon: UserPlus,
  },
  {
    title: 'Track Applications',
    description: 'Monitor your application status and progress in real-time.',
    buttonText: 'Check Status',
    link: '/login',
    icon: Activity,
  },
  {
    title: 'Secure Platform',
    description: 'Your data is protected with industry-standard security measures.',
    buttonText: 'Learn More',
    link: '/about',
    icon: ShieldCheck,
  },
]


  return (
  <div  className="pt-10 flex flex-col">
    {/* hero */}
     <section className="dotted-background  py-16 md:py-28">
      <div className=" text-center">
        <div className="mb-8 ">
          <h1 className="text-5xl md:text-8xl mb-4 gradient-title" >Welcome to ERS </h1>
          <p className="text-xl text-blue-400 mb-8 max-w-2xl mx-auto">Your gateway to employment registration and managemen</p>
         </div>
         <div className='max-w-3xl mx-auto'><HomeSearch/></div>   
      </div>
    </section>

    <section className='py-12 bg-gray-50'>
    <div className='container mx-auto px-4'>
        <h2  className="text-2xl font-bold text-center mb-12">Why Employment Application System </h2>
            <div className="grid gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="flex h-full flex-col bg-violet-50 shadow-md rounded-2xl"
        >
          <CardContent className="flex-grow p-6">
            <CardTitle className="text-2xl text-violet-900 mb-2">
              {card.title}
            </CardTitle>
            <CardDescription className="text-violet-700">
              {card.description}
            </CardDescription>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-0">
            <Button
              asChild
              variant="outline"
              className="w-full border-violet-500 text-violet-600 hover:bg-violet-100"
            >
              <Link to={card.link}>{card.buttonText}</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>

    </div>
    </section>

    <section className='py-12'>
        <div className="container mx-auto px-4  ">   
          <h2 className="text-2xl font-bold text-center mb-8">
            Application Process Frequently Asked Question 
          </h2>        
         <Accordion type='single' collapsible className='w-full '>
          {Process.map((faq,index)=>(
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
         </Accordion>
      </div>

    </section>

  </div>
  );
}
