import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Welcome to BragBoard
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Share your achievements and celebrate your wins
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
            size="lg"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
