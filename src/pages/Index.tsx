import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="text-center space-y-8 p-8 relative z-10 max-w-4xl">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Welcome to BragBoard
          </h1>
          <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Celebrate Every Win Together
          </p>
        </div>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          Share achievements, give recognition, and build a culture of appreciation in your team
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <Button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-elegant hover:scale-105 transition-all duration-300 text-lg py-6 px-8"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            size="lg"
            className="border-2 hover:bg-primary/5 hover:border-primary hover:scale-105 transition-all duration-300 text-lg py-6 px-8"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
